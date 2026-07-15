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
      content: "You must join the game jam before joining a team.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (GamejamData.Participants.in_a_team(interaction.user)) {
    interaction.reply({
      content: "You are already in a team. You cannot join another team.",
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
      content: "You have already requested to join this team.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const message = await team.owner.send(
    CreateJoinRequestMessage(interaction.user, team),
  );

  GamejamData.JoinRequests.add(interaction.user, team, message);

  interaction.reply({
    content: `Your request to join ${team.team_name} has been sent to the team owner.`,
    flags: MessageFlags.Ephemeral,
  });
});

function CreateJoinRequestMessage(
  fromUser: User,
  team: GamejamTeam,
): MessageCreateOptions {
  return {
    content: `User ${fromUser.tag} wants to join your team ${team.team_name}.`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_join`)
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_join`)
          .setLabel("Reject")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  };
}

buttonRegistry.set("accept_join", async (interaction) => {
  const request = await GamejamData.JoinRequests.pop(interaction.message);
  if (!request) {
    interaction.reply({
      content: "This join request has already been handled.",
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
    `Your request to join ${request.team?.team_name} has been accepted.`,
  );
  interaction.reply({
    content: `You have accepted ${request.user.tag}'s request to join your team.`,
    flags: MessageFlags.Ephemeral,
  });
});

buttonRegistry.set("reject_join", async (interaction) => {
  const request = await GamejamData.JoinRequests.pop(interaction.message);
  if (!request) {
    interaction.reply({
      content: "This join request has already been handled.",
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
    content: `Your request to join ${request.team?.team_name} has been rejected.`,
  });
  interaction.reply({
    content: `You have rejected ${request.user.tag}'s request to join your team.`,
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
      content: "Only the team owner can submit the game.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  interaction.showModal(
    new ModalBuilder()
      .setCustomId("submit_game")
      .setTitle("Submit Game")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Submission Name")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("game_name")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
        new LabelBuilder()
          .setLabel("Description")
          .setDescription("Optional")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("game_description")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false),
          ),
        new LabelBuilder()
          .setLabel("Game URL")
          .setDescription("Preferably an itch.io link.")
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
      content: "Only the team owner can submit the game.",
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
    content: `Your game has been submitted!`,
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
      content: "You are not in this team.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ownerLeaving = interaction.user.id === team.owner.id;

  confirmPrompt(
    interaction,
    ownerLeaving
      ? "Are you sure? **If the team owner leaves, your team will be disbanded.**"
      : "Are you sure you want to leave your team?",
    async (confirmation) => {
      await leave_team(interaction.user, team);
      if (ownerLeaving) {
        await confirmation.deferUpdate();
      } else {
        await confirmation.update({
          content: "You have left the team.",
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

  var description = `**Leader:**<@${team.owner.id}>\n**Members:**\n${memberList}`;
  const submission = GamejamData.Submissions.get(team);

  if (submission) {
    description.concat(`\n**Submission:** \`${submission.game_name}\``);
    if (submission.description) {
      description.concat(`\n**Description:** ${submission.description}`);
    }
    description.concat(`\n**URL:** ${submission.game_url}`);
  }

  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("join_team")
          .setLabel("Join Team")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("submit_game")
          .setLabel("Submit Game")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("leave_team")
          .setLabel("Leave Team")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`**Team: \`${team.team_name}\`**`)
        .setDescription(description),
    ],
  };
}
