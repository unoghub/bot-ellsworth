import { type Command } from "@/types/command.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Force update cycle."),
  async execute(interaction) {
    interaction.reply({
      content: "Refreshed!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
