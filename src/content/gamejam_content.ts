import buttonRegistry from "@/services/buttonRegistry.js";
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
  const name = interaction.fields.getTextInputValue("nameInput");

  console.log(name);
  interaction.reply({ content: name, flags: MessageFlags.Ephemeral });
});

export const GamejamMenu = {
  content: "Welcome to the game jam and stuff",
  components: [row],
} satisfies MessageCreateOptions;
