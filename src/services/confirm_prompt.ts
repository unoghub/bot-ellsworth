import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  MessageFlags,
  type ButtonInteraction,
  type Interaction,
} from "discord.js";

export async function confirmPrompt(
  interaction: Interaction,
  message: string,
  func: (interaction: ButtonInteraction) => Promise<void>,
) {
  if (!interaction.isRepliable()) throw new Error("no repliable");
  await interaction.reply({
    content: message,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm")
          .setLabel("Evet")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Hayır")
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
      await func(confirmation);
    } else {
      await confirmation.update({
        content: "İptal edildi.",
        components: [],
      });
    }
  } catch {
    try {
      await interaction.editReply({
        content: "Onaylama süresi doldu.",
        components: [],
      });
    } catch (e) {
      if (!(e instanceof DiscordAPIError && e.code === 10008)) {
        throw e;
      }
    }
  }
}
