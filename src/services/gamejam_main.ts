import { Events, type RepliableInteraction } from "discord.js";
import { client, service_ready } from "./client.js";
import { create_panel_channel, update_panel_message } from "./gamejam_panel.js";
import { GamejamData } from "./gamejam_data.js";
import { createJammerRole, createOperatorRole } from "./gamejam_roles.js";
import {
  create_communications_category,
  create_teams_channel,
  validate_team_channels,
} from "./gamejam_teams.js";
import { create_archive_category } from "./gamejam_operator.js";

export async function setup_gamejam(interaction?: RepliableInteraction) {
  if (!interaction?.guild) return;
  service_ready.lock();

  const current_guild = await GamejamData.Guild.get();
  const new_guild = current_guild?.id === interaction.guild.id;
  GamejamData.Guild.set(interaction.guild);
  console.log("Set guild to", interaction.guild.id);
  const jammer_role = await createJammerRole(interaction, { new: true });
  console.log("Set jammer role to", jammer_role.id);
  const operator_role = await createOperatorRole(interaction, { new: true });
  console.log("Set operator role to", operator_role.id);
  const channel = await create_panel_channel({ new: true });
  console.log("Set channel to", channel.id);
  const main_panel = await update_panel_message();
  console.log("Set panel message to", main_panel.id);
  const teams_forum = await create_teams_channel({ new: true });
  console.log("Set team forum to", teams_forum.id);
  const comm_category = await create_communications_category({ new: true });
  console.log("Set communications category to", comm_category.id);
  const archive_category = await create_archive_category({ new: true });
  console.log("Set archive category to", archive_category.id);
  validate_team_channels();
  console.log("Team instances validated");

  service_ready.unlock();
}
