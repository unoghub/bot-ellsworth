import { GamejamData } from "@/services/gamejam_data.js";
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
    GamejamData.Guild.set(interaction.guild);
    console.log("Set guild to", interaction.guild.id);
    const jammer_role = await createJammerRole(interaction);
    console.log("Set jammer role to", jammer_role.id);
    const operator_role = await createOperatorRole(interaction);
    console.log("Set operator role to", operator_role.id);
    const channel = await create_panel_channel();
    console.log("Set channel to", channel.id);
    const main_panel = await update_panel_message();
    console.log("Set panel message to", main_panel.id);
    const teams_forum = await create_teams_channel();
    console.log("Set team forum to", teams_forum.id);
    const comm_category = await create_communications_category();
    console.log("Set communications category to", comm_category.id);
    const archive_category = await create_archive_category();
    console.log("Set archive category to", archive_category.id);

    interaction.reply({
      content: "Everything set up!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
