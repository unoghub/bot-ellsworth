import { type Command } from "@/types/command.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check ping."),
  async execute(interaction) {
    interaction.reply({
      content: "Pong!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
