import { setup_jam_view } from "@/services/gamejam_service.js";
import { type Command } from "@/types/command.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Check ping."),
  async execute(interaction) {
    setup_jam_view();
    interaction.reply({
      content: "Refreshed!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
