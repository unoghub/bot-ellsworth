import type { GamejamTeam } from "@/services/gamejam_data.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type GuildForumThreadMessageCreateOptions,
} from "discord.js";

export async function CreateGamejamTeamControls(
  teamData: Omit<GamejamTeam, "id" | "thread" | "control_message">,
): Promise<GuildForumThreadMessageCreateOptions> {
  return {
    content: `**Team Name:** ${teamData.team_name}`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("join_team")
          .setLabel("Join Team")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("submit_game")
          .setLabel("Submit Game")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("leave_team")
          .setLabel("Leave Team")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("disband_team")
          .setLabel("Disband")
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  };
}
