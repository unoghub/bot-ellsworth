import {
  ChannelType,
  Events,
  Message,
  User,
  type ForumChannel,
  type ForumThreadChannel,
  type OverwriteResolvable,
  type PermissionOverwriteResolvable,
} from "discord.js";
import { GamejamData, type GamejamTeam } from "./gamejam_data.js";
import { GenerateTeamView } from "@/content/gamejam_team_controls.js";
import { client } from "./client.js";

client.on(Events.ChannelDelete, async (channel) => {
  if (channel.id !== (await GamejamData.TeamsForum.Channel.rawget())) return;
  console.log("oh my god the channel got deleted");
  GamejamData.TeamsForum.Channel.clear();
});

export async function create_teams_channel(): Promise<ForumChannel> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const jammerRole = await GamejamData.JammerRole.get();
  if (!jammerRole) throw new Error("no role");

  const operatorRole = await GamejamData.OperatorRole.get();
  if (!operatorRole) throw new Error("no role");

  var perms = [
    {
      id: jammerRole.id,
      allow: ["ViewChannel"],
    },
    {
      id: operatorRole.id,
      allow: ["ViewChannel", "SendMessagesInThreads"],
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
  ] as OverwriteResolvable[];

  const existingChannel =
    (await GamejamData.TeamsForum.Channel.get()) as ForumChannel;
  if (existingChannel) {
    console.log("Menu channel already exists");
    existingChannel.permissionOverwrites.set(perms);
    return existingChannel as ForumChannel;
  }

  const channel = await guild.channels.create({
    name: "gamejam-teams",
    type: ChannelType.GuildForum,
    topic: "Gamejam menu",
    permissionOverwrites: perms,
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
    message: { content: "placeholder" },
  });
  const message = await forumThreadChannel.fetchStarterMessage();
  if (!message) throw new Error("What the hey?");
  return [forumThreadChannel, message];
}

export async function update_team_thread(team: GamejamTeam) {
  team.control_message.edit(await GenerateTeamView(team));
}

export async function delete_team(team: GamejamTeam) {
  GamejamData.Teams.delete(team);

  await team.thread.delete();
}

export async function leave_team(user: User, team: GamejamTeam) {
  const ownerLeaving = user.id === team.owner.id;

  if (ownerLeaving) {
    delete_team(team);
  } else {
    GamejamData.Teams.leave_team(user, team);
    update_team_thread(team);
  }
}
