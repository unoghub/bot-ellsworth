import { type Command } from "@/types/command.js";
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check ping."),
  async execute(client, interaction) {
    interaction.reply("Pong!");
  },
} satisfies Command;
