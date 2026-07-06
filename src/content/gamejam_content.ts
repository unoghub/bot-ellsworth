import buttonRegistry from "@/services/buttonRegistry.js";
import { GamejamData } from "@/services/gamejam_data.js";
import modalRegistry from "@/services/modalRegistry.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type MessageCreateOptions,
} from "discord.js";

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId("join_jam")
    .setLabel("Join the Game Jam")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("create_jam_team")
    .setLabel("Create a Jam team")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("leave_jam")
    .setLabel("Leave the Jam")
    .setStyle(ButtonStyle.Danger),
);

buttonRegistry.set("join_jam", async (interaction) => {
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId("join_jam")
      .setTitle("Join Game Jam")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Legal Name")
          .setDescription("Your legal name")
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
  const legal_name = interaction.fields.getTextInputValue("nameInput");

  const role = await GamejamData.JammerRole.get();
  const guild = interaction.guild;
  if (role && guild) {
    const member = await guild.members.fetch(interaction.user.id);

    if (member && member.roles) {
      await member.roles.add(role);
    }
  }

  GamejamData.Participants.set(interaction.user, {
    legal_name: legal_name,
  });

  interaction.reply({
    content: "Successfully joined the game jam.",
    flags: MessageFlags.Ephemeral,
  });
});

export const GamejamMenu = {
  content: "Welcome to the game jam and stuff",
  components: [row],
} satisfies MessageCreateOptions;
