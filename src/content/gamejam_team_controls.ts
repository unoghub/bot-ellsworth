import { client } from "@/services/client.js";
import { confirmPrompt } from "@/services/confirm_prompt.js";
import {
  fetchChannel,
  fetchMessage,
  GamejamData,
  type GamejamTeam,
} from "@/services/gamejam_data.js";
import { leave_team, update_team_channels } from "@/services/gamejam_teams.js";
import { buttonRegistry, modalRegistry } from "@/services/registry.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  User,
  type MessageCreateOptions,
  type MessageEditOptions,
} from "discord.js";

buttonRegistry.set("join_team", async (interaction) => {
  if (!GamejamData.Participants.exists(interaction.user)) {
    interaction.reply({
      content: "Bir ekibe katılmadan önce jam'e katılmalısınız.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (GamejamData.Participants.in_a_team(interaction.user)) {
    interaction.reply({
      content: "Zaten bir ekiptesiniz. Başka bir ekibe katılamazsınız.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!interaction.channel?.isThread()) throw new Error("not thread");
  const team = await GamejamData.Teams.get_team_from_thread(
    interaction.channel,
  );
  if (!team) throw new Error("no team");
  if (GamejamData.JoinRequests.exists(interaction.user, team)) {
    interaction.reply({
      content: "Bu ekibe katılmak için zaten bir istek gönderdiniz.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const message = await team.owner.send(
    CreateJoinRequestMessage(interaction.user, team),
  );

  GamejamData.JoinRequests.add(interaction.user, team, message);

  interaction.reply({
    content: `${team.team_name} ekibine katılma isteğiniz ekip sahibine gönderildi.`,
    flags: MessageFlags.Ephemeral,
  });
});

function CreateJoinRequestMessage(
  fromUser: User,
  team: GamejamTeam,
): MessageCreateOptions {
  return {
    content: `${fromUser.tag} adlı kullanıcı ${team.team_name} ekibinize katılmak istiyor.`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_join`)
          .setLabel("Kabul Et")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_join`)
          .setLabel("Reddet")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  };
}

buttonRegistry.set("accept_join", async (interaction) => {
  const request = await GamejamData.JoinRequests.pop(interaction.message);
  if (!request) {
    interaction.reply({
      content: "Bu katılım isteği zaten işleme alınmış.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  GamejamData.JoinRequests.clear_user(request.user);
  GamejamData.Teams.add_to_team(request.user, request.team);

  try {
    const channel = await fetchChannel(interaction.channelId);
    if (!channel?.isTextBased()) return;
    channel.messages.delete(interaction.message.id);
  } catch {
    console.log("deletion failed");
  }

  update_team_channels(request.team);
  request.user.send(
    `${request.team?.team_name} ekibine katılma isteğiniz kabul edildi.`,
  );
  interaction.reply({
    content: `${request.user.tag} kullanıcısının ekibinize katılma isteğini kabul ettiniz.`,
    flags: MessageFlags.Ephemeral,
  });
});

buttonRegistry.set("reject_join", async (interaction) => {
  const request = await GamejamData.JoinRequests.pop(interaction.message);
  if (!request) {
    interaction.reply({
      content: "Bu katılım isteği zaten işleme alınmış.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const channel = await fetchChannel(interaction.channelId);
    if (!channel?.isTextBased()) return;
    channel.messages.delete(interaction.message.id);
  } catch {
    console.log("deletion failed");
  }
  request.user.send({
    content: `${request.team?.team_name} ekibine katılma isteğiniz reddedildi.`,
  });
  interaction.reply({
    content: `${request.user.tag} kullanıcısının ekibinize katılma isteğini reddettiniz.`,
    flags: MessageFlags.Ephemeral,
  });
});

buttonRegistry.set("submit_game", async (interaction) => {
  if (!interaction.channel?.isThread()) throw new Error("no thread");
  const team = await GamejamData.Teams.get_team_from_thread(
    interaction.channel,
  );
  if (!team) throw new Error("No team");

  if (interaction.user.id != team.owner.id) {
    interaction.reply({
      content: "Oyunu yalnızca ekip sahibi gönderebilir.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  interaction.showModal(
    new ModalBuilder()
      .setCustomId("submit_game")
      .setTitle("Oyun Gönder")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Oyun Adı")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("game_name")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        new LabelBuilder()
          .setLabel("Açıklama")
          .setDescription("İsteğe bağlı")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("game_description")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false),
          ),
        new LabelBuilder()
          .setLabel("Oyun Bağlantısı")
          .setDescription("Tercihen bir itch.io bağlantısı.")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("game_url")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      ),
  );
});

modalRegistry.set("submit_game", async (interaction) => {
  if (!interaction.channel?.isThread()) throw new Error("no thread");
  const team = await GamejamData.Teams.get_team_from_thread(
    interaction.channel,
  );
  if (!team) throw new Error("No team");

  if (interaction.user.id != team.owner.id) {
    interaction.reply({
      content: "Oyunu yalnızca ekip sahibi gönderebilir.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const game_name = interaction.fields.getTextInputValue("game_name");
  const description = interaction.fields.getTextInputValue("game_description");
  const game_url = interaction.fields.getTextInputValue("game_url");

  GamejamData.Submissions.set({
    team,
    game_name,
    description,
    game_url,
  });

  update_team_channels(team);
  interaction.reply({
    content: `Oyununuz başarıyla gönderildi!`,
    flags: MessageFlags.Ephemeral,
  });
});

buttonRegistry.set("leave_team", async (interaction) => {
  if (!interaction.channel?.isThread()) throw new Error("no thread");
  const team = await GamejamData.Teams.get_team_from_thread(
    interaction.channel,
  );
  if (!team) throw new Error("No team");

  if (!GamejamData.Teams.user_in_team(interaction.user, team)) {
    interaction.reply({
      content: "Bu ekipte değilsiniz.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ownerLeaving = interaction.user.id === team.owner.id;

  confirmPrompt(
    interaction,
    ownerLeaving
      ? "Emin misiniz? **Ekip sahibi ayrılırsa ekibiniz dağıtılacaktır.**"
      : "Ekibinizden ayrılmak istediğinize emin misiniz?",
    async (confirmation) => {
      await leave_team(interaction.user, team);
      if (ownerLeaving) {
        await confirmation.deferUpdate();
      } else {
        await confirmation.update({
          content: "Ekipten ayrıldınız.",
          components: [],
        });
      }
    },
  );
});

export async function GenerateTeamView(
  team: GamejamTeam,
): Promise<MessageEditOptions> {
  const members = await GamejamData.Teams.get_members(team);

  const memberList = members.map((member) => `• <@${member.id}>`).join("\n");

  var description = `**Lider:**<@${team.owner.id}>\n**Üyeler:**\n${memberList}`;
  const submission = GamejamData.Submissions.get(team);

  if (submission) {
    description.concat(`\n**Gönderim:** \`${submission.game_name}\``);
    if (submission.description) {
      description.concat(`\n**Açıklama:** ${submission.description}`);
    }
    description.concat(`\n**Bağlantı:** ${submission.game_url}`);
  }

  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("join_team")
          .setLabel("Ekibe Katıl")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("submit_game")
          .setLabel("Oyun Gönder")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("leave_team")
          .setLabel("Ekipten Ayrıl")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`**Ekip: \`${team.team_name}\`**`)
        .setDescription(description),
    ],
  };
}
