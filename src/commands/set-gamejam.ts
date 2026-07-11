import { GamejamData } from "@/services/gamejam_data.js";
import {
  create_panel_channel,
  update_panel_message,
} from "@/services/gamejam_panel.js";
import { createRole } from "@/services/gamejam_roles.js";
import { create_teams_channel } from "@/services/gamejam_teams.js";
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
    GamejamData.Guild.set(interaction.guild);
    console.log("Set guild to", interaction.guild.id);
    const role = await createRole(interaction);
    console.log("Set role to", role.id);
    const channel = await create_panel_channel();
    console.log("Set channel to", channel.id);
    const main_panel = await update_panel_message();
    console.log("Set panel message to", main_panel.id);
    const teams_forum = await create_teams_channel();
    console.log("Set team forum to", teams_forum.id);

    interaction.reply({
      content: "Everything set up!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
