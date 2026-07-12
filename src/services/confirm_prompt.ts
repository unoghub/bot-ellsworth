import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type ButtonInteraction,
  type Interaction,
} from "discord.js";

export async function confirmPrompt(
  interaction: Interaction,
  message: string,
  func: (interaction: ButtonInteraction) => void,
) {
  if (!interaction.isRepliable()) throw new Error("no repliable");
  await interaction.reply({
    content: message,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm")
          .setLabel("Yes")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("No")
          .setStyle(ButtonStyle.Secondary),
      ),
    ],
    flags: MessageFlags.Ephemeral,
    withResponse: true,
  });

  const reply = await interaction.fetchReply();
  try {
    const confirmation = await reply.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
    });

    if (!confirmation.isButton()) throw new Error("no button");

    if (confirmation.customId === "confirm") {
      func(confirmation);
    } else {
      await confirmation.update({
        content: "Cancelled.",
        components: [],
      });
    }
  } catch {
    await interaction.editReply({
      content: "Confirmation timed out.",
      components: [],
    });
  }
}
