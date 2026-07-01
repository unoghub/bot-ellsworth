import { GamejamData } from "@/services/gamejam_data.js";
import type { Command } from "@/types/command.js";
import {
  MessageFlags,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set-jammer-role")
    .setDescription("Sets role associated with the game jam participants.")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
    .addRoleOption((option) =>
      option.setName("role").setDescription("Jammer Role").setRequired(true),
    ),
  async execute(interaction) {
    const role = interaction.options.getRole("role");

    if (!(role instanceof Role)) {
      interaction.reply({
        content: "Please provide a forum channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    GamejamData.JammerRole.set(role);

    interaction.reply({
      content: "Role set",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
