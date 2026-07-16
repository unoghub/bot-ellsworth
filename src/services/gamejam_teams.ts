import {
  CategoryChannel,
  ChannelType,
  Events,
  Message,
  OverwriteType,
  ThreadChannel,
  User,
  VoiceChannel,
  type ForumChannel,
  type ForumThreadChannel,
  type OverwriteResolvable,
} from "discord.js";
import {
  fetchChannel,
  fetchChannelWithType,
  fetchMessage,
  GamejamData,
  type GamejamTeam,
  type RawGamejamTeam,
} from "./gamejam_data.js";
import { GenerateTeamView } from "@/content/gamejam_team_controls.js";
import { client } from "./client.js";
import { removeJammerRoleFromUser } from "./gamejam_roles.js";

client.on(Events.ChannelDelete, async (channel) => {
  if (channel.id !== (await GamejamData.TeamsForum.Channel.rawget())) return;
  console.log("oh my god the channel got deleted");
  GamejamData.TeamsForum.Channel.clear();
});

export async function create_teams_channel(options?: {
  new?: boolean;
}): Promise<ForumChannel> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const jammerRole = await GamejamData.JammerRole.get();
  if (!jammerRole) throw new Error("no role");

  const operatorRole = await GamejamData.OperatorRole.get();
  if (!operatorRole) throw new Error("no role");

  var perms = [
    {
      id: jammerRole.id,
      allow: ["ViewChannel", "SendMessagesInThreads"],
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

  if (!options?.new) {
    const existingChannel =
      (await GamejamData.TeamsForum.Channel.get()) as ForumChannel;
    if (existingChannel) {
      console.log("Menu channel already exists");
      existingChannel.permissionOverwrites.set(perms);
      return existingChannel as ForumChannel;
    }
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

export async function create_team_thread(teamData: {
  team_name: string;
}): Promise<[ForumThreadChannel, Message]> {
  const channel = (await GamejamData.TeamsForum.Channel.get()) as ForumChannel;
  if (!channel) throw new Error("no channel");
  const forumThreadChannel = await channel.threads.create({
    name: teamData.team_name,
    message: { content: teamData.team_name },
  });
  const message = await forumThreadChannel.fetchStarterMessage();
  if (!message) throw new Error("What the hey?");
  return [forumThreadChannel, message];
}

export async function create_control_message(
  thread: ThreadChannel,
): Promise<Message<boolean>> {
  const out = await thread.send({
    content: "Team controls",
  });

  out.pin();
  return out;
}

export async function update_team_channels(team: GamejamTeam) {
  team.control_message.edit(await GenerateTeamView(team));

  update_communication(team);
}

export async function delete_team(team: GamejamTeam) {
  const archive_category = await GamejamData.ArchiveCategory.get();
  if (!archive_category) throw new Error("no category");

  GamejamData.Teams.delete(team);

  await team.voice_channel.setParent(archive_category);
  await team.thread.delete();
}

export async function leave_jam(user: User) {
  const team = await GamejamData.Participants.get_team(user);
  if (team) {
    leave_team(user, team);
  }

  await removeJammerRoleFromUser(user);
  GamejamData.Participants.remove(user);
}

export async function leave_team(user: User, team: GamejamTeam) {
  const ownerLeaving = user.id === team.owner.id;

  if (ownerLeaving) {
    delete_team(team);
  } else {
    GamejamData.Teams.leave_team(user, team);
    update_team_channels(team);
  }
}

export async function create_communications_category(options?: {
  new?: boolean;
}): Promise<CategoryChannel> {
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
      allow: ["ViewChannel"],
    },
    {
      id: guild.roles.everyone.id,
      deny: ["ViewChannel"],
    },
  ] as OverwriteResolvable[];

  if (!options?.new) {
    const existingCategory = await GamejamData.CommunicationsCategory.get();
    if (existingCategory) {
      console.log("Communications category already exists");
      existingCategory.permissionOverwrites.set(perms);
      return existingCategory as CategoryChannel;
    }
  }

  const category = await guild.channels.create({
    name: "gamejam-communications",
    type: ChannelType.GuildCategory,
    permissionOverwrites: perms,
  });
  GamejamData.CommunicationsCategory.set(category);

  return category;
}

async function update_communication(team: GamejamTeam) {
  const voice_channel = team.voice_channel;

  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const operatorRole = await GamejamData.OperatorRole.get();
  if (!operatorRole) throw new Error("no role");

  const perms = [
    ...(await GamejamData.Teams.get_members(team)).map((member) => ({
      id: member.id,
      type: OverwriteType.Member,
      allow: ["ViewChannel"],
    })),
    {
      id: operatorRole.id,
      allow: ["ViewChannel"],
    },
    {
      id: guild.roles.everyone.id,
      deny: ["ViewChannel"],
    },
  ] as OverwriteResolvable[];

  await voice_channel.permissionOverwrites.set(perms);
}

export async function create_voice_communication(
  team_name: string,
): Promise<VoiceChannel> {
  const category =
    (await GamejamData.CommunicationsCategory.get()) as CategoryChannel;
  if (!category) throw new Error("no category");

  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const operatorRole = await GamejamData.OperatorRole.get();
  if (!operatorRole) throw new Error("no role");

  const perms = [
    {
      id: operatorRole.id,
      allow: ["ViewChannel"],
    },
    {
      id: guild.roles.everyone.id,
      deny: ["ViewChannel"],
    },
  ] as OverwriteResolvable[];

  const channel = await category.guild.channels.create({
    name: team_name,
    type: ChannelType.GuildVoice,
    permissionOverwrites: perms,
    parent: category,
  });

  return channel;
}

async function soft_delete_team(team: RawGamejamTeam) {
  const archiveChannel = await GamejamData.ArchiveCategory.get();

  fetchChannelWithType(team.voice_channel, ChannelType.GuildVoice).then(
    (channel) => {
      if (!channel) return;
      if (archiveChannel) {
        (channel as VoiceChannel).setParent(archiveChannel);
      } else {
        channel.delete();
      }
    },
  );
  GamejamData.Teams.delete_with_id(team.id);
}

client.on(Events.ThreadDelete, async (thread) => {
  if (!thread.parent) return;
  if (thread.parent.id !== (await GamejamData.TeamsForum.Channel.get())?.id)
    return;
  const team = await GamejamData.Teams.get_team_from_thread(thread, {
    raw: true,
  });
  if (!team) return;

  console.log("team channel deleted, deleting team.");
  soft_delete_team(team);
});

export async function validate_team_channels() {
  const raw_teams = await GamejamData.Teams.raw_get_all();

  await Promise.all(
    raw_teams.map(async (team_raw) => {
      const thread = await fetchChannel(team_raw.control_channel);
      if (!thread) {
        console.log("team with missing thread, deleting team.");
        soft_delete_team(team_raw);
        return;
      }

      var modified = false;
      let vc = await fetchChannel(team_raw.voice_channel);
      if (!vc) {
        console.log("team with missing vc, recreating.");
        vc = await create_voice_communication(team_raw.team_name);
        modified = true;
      }
      let message = await fetchMessage(thread.id, team_raw.buttons_message);
      if (!message) {
        console.log("team with missing message, resending.");
        message = await create_control_message(thread as ThreadChannel);
        modified = true;
      }

      const team = {
        id: team_raw.id,
        team_name: team_raw.team_name,
        owner: await client.users.fetch(team_raw.owner_id),
        voice_channel: vc as VoiceChannel,
        control_message: message,
        thread: thread as ThreadChannel,
      };

      if (modified) {
        await GamejamData.Teams.set_team(team);
      }

      update_team_channels(team);
    }),
  );
}
