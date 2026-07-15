import { update_panel_message } from "@/services/gamejam_panel.js";
import { validate_team_channels } from "@/services/gamejam_teams.js";
import { type Command } from "@/types/command.js";
import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Force update cycle.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    update_panel_message();
    validate_team_channels();
    interaction.reply({
      content: "Refreshed!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
