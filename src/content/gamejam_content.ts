import { confirmPrompt } from "@/services/confirm_prompt.js";
import { GamejamData } from "@/services/gamejam_data.js";
import {
  addJammerRoleToUser,
  removeJammerRoleFromUser,
} from "@/services/gamejam_roles.js";
import {
  create_team_thread,
  create_voice_communication,
  leave_jam,
  leave_team,
  update_team_channels,
} from "@/services/gamejam_teams.js";
import { buttonRegistry, modalRegistry } from "@/services/registry.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type MessageCreateOptions,
} from "discord.js";

buttonRegistry.set("join_jam", async (interaction) => {
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId("join_jam")
      .setTitle("Jame Katıl")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Ad Soyad")
          .setDescription("Yasal ad ve soyadınız")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("nameInput")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      ),
  );
});

modalRegistry.set("join_jam", async (interaction) => {
  if (GamejamData.Blacklist.exists(interaction.user)) {
    interaction.reply({
      content: "Jam'den yasaklandığınız için katılamazsınız.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const legal_name = interaction.fields.getTextInputValue("nameInput");
  const old_data = GamejamData.Participants.get(interaction.user);

  await addJammerRoleToUser(interaction.user);

  GamejamData.Participants.set(interaction.user, {
    legal_name: legal_name,
  });

  if (old_data) {
    interaction.reply({
      content: "Jam bilgileriniz başarıyla güncellendi.",
      flags: MessageFlags.Ephemeral,
    });
  } else {
    interaction.reply({
      content: "Jam'e başarıyla katıldınız.",
      flags: MessageFlags.Ephemeral,
    });
  }
});

buttonRegistry.set("leave_jam", async (interaction) => {
  if (!GamejamData.Participants.get(interaction.user)) {
    interaction.reply({
      content: "Şu anda jam'e katılımcı olarak kayıtlı değilsiniz.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await confirmPrompt(
    interaction,
    "Jam'den ayrılmak istediğinize emin misiniz?",
    async (confirmation) => {
      await leave_jam(interaction.user);

      confirmation.reply({
        content: "Jam'den başarıyla ayrıldınız.",
        flags: MessageFlags.Ephemeral,
      });
    },
  );
});

buttonRegistry.set("create_jam_team", async (interaction) => {
  if (!GamejamData.Participants.get(interaction.user)) {
    interaction.reply({
      content: "Ekip oluşturabilmek için jam'e katılımcı olmalısınız.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (GamejamData.Participants.in_a_team(interaction.user)) {
    interaction.reply({
      content: "Zaten bir ekiptesiniz. Yeni bir ekip oluşturamazsınız.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId("create_jam_team")
      .setTitle("Ekip Oluştur")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Ekip Adı")
          .setDescription("Ekibinizin adı")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("team_name")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      ),
  );
});

modalRegistry.set("create_jam_team", async (interaction) => {
  const team_name = interaction.fields.getTextInputValue("team_name");
  if (GamejamData.Participants.in_a_team(interaction.user)) {
    interaction.reply({
      content: "Zaten bir ekiptesiniz. Yeni bir ekip oluşturamazsınız.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const [thread, message] = await create_team_thread({
    team_name,
  });

  const voice_channel = await create_voice_communication(team_name);
  const team = GamejamData.Teams.set_team({
    owner: interaction.user,
    team_name,
    control_message: message,
    thread,
    voice_channel,
  });

  await update_team_channels(team);

  interaction.reply({
    content: `"${team_name}" ekibi başarıyla oluşturuldu.`,
    flags: MessageFlags.Ephemeral,
  });
});

export function generateGamejamMenu() {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("join_jam")
          .setLabel("Jame Katıl")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("create_jam_team")
          .setLabel("Ekip oluştur")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("leave_jam")
          .setLabel("Jam'den çık")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("ÜNOG Ankara Game Jam 2026")
        .setDescription(
          `ÜNOG'un ilk defa düzenlemiş olduğu Ankara Game Jam etkiniğimize hoşgeldiniz. Aşağıdaki butonlara tıklayarak katılım sağlayabilirsiniz.`,
        ),
    ],
  } satisfies MessageCreateOptions;
}
