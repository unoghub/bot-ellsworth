import { GamejamData } from "@/services/gamejam_data.js";
import { setup_gamejam } from "@/services/gamejam_main.js";
import { create_archive_category } from "@/services/gamejam_operator.js";
import {
  create_panel_channel,
  update_panel_message,
} from "@/services/gamejam_panel.js";
import {
  createJammerRole,
  createOperatorRole,
} from "@/services/gamejam_roles.js";
import {
  create_communications_category,
  create_teams_channel,
  validate_team_channels,
} from "@/services/gamejam_teams.js";
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
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),
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
