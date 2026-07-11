import {
  ChannelType,
  Message,
  ThreadChannel,
  type ForumChannel,
  type ForumThreadChannel,
} from "discord.js";
import { GamejamData, type GamejamTeam } from "./gamejam_data.js";
import { CreateGamejamTeamControls } from "@/content/gamejam_team_controls.js";

export async function create_teams_channel(): Promise<ForumChannel> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const existingChannel = await GamejamData.TeamsForum.Channel.get();
  if (existingChannel) {
    console.log("Menu channel already exists");
    return existingChannel as ForumChannel;
  }

  const jammerRole = await GamejamData.JammerRole.get();
  if (!jammerRole) throw new Error("no role");

  const channel = await guild.channels.create({
    name: "gamejam-teams",
    type: ChannelType.GuildForum,
    topic: "Gamejam menu",
    permissionOverwrites: [
      {
        id: jammerRole.id,
        allow: ["ViewChannel"],
      },
      {
        id: guild.roles.everyone.id,
        deny: [
          "ViewChannel",
          "CreatePublicThreads",
          "SendMessages",
          "SendMessagesInThreads",
        ],
      },
    ],
  });
  GamejamData.TeamsForum.Channel.set(channel);

  return channel;
}

export async function create_team_thread(
  teamData: Omit<GamejamTeam, "id" | "thread" | "control_message">,
): Promise<[ForumThreadChannel, Message]> {
  const channel = (await GamejamData.TeamsForum.Channel.get()) as ForumChannel;
  if (!channel) throw new Error("no channel");
  const forumThreadChannel = await channel.threads.create({
    name: teamData.team_name,
    message: await CreateGamejamTeamControls(teamData),
  });
  const message = await forumThreadChannel.fetchStarterMessage();
  if (!message) throw new Error("What the hey?");
  return [forumThreadChannel, message];
}
