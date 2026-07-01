import { GamejamData } from "@/services/gamejam_data.js";
import type { Command } from "@/types/command.js";
import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set-guild")
    .setDescription("Sets current guild as the main game jam guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),
  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      interaction.reply({
        content: "This command can only be used in a guild.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    GamejamData.Guild.set(guild);

    interaction.reply({
      content: "Guild set",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
