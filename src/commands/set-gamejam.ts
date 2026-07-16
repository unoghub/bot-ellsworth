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
    .setDescription("Jam katılımcılarıyla ilişkili rolü ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "Bu komut yalnızca bir sunucuda kullanılabilir.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    setup_gamejam(interaction);
    interaction.reply({
      content: "Her şey kuruldu!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
