import { setup_gamejam } from "@/services/gamejam_main.js";
import type { Command } from "@/types/command.js";
import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set-jam")
    .setDescription("Sets role associated with the game jam participants.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    setup_gamejam(interaction);
    interaction.reply({
      content: "Everything set up!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
