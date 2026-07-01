import { ChannelType } from "discord.js";
import { JSONFilePreset } from "lowdb/node";
import { client } from "./client.js";

type Data = {
  guild_id: string;
  jam_menu_message: string;
  commands_channel: string;
  teams_channel: string;
  jammer_role_id: string;
  jammer_blacklist: { id: string; reason: string }[];
  participants: { id: string }[];
  jam_teams: {
    team_name: string;
    control_channel: string;
    buttons_message: string;
  }[];
};

const defaultData: Data = {
  guild_id: "",
  jam_menu_message: "",
  commands_channel: "",
  teams_channel: "",
  jammer_role_id: "",
  jammer_blacklist: [],
  participants: [],
  jam_teams: [],
};
const db = await JSONFilePreset("data/gamejam_variables.json", defaultData);

export const GamejamData = {
  Guild: createDiscordAccessor("guild_id", (id) => client.guilds.fetch(id)),
  JammerRole: createDiscordAccessor("jammer_role_id", async (id) =>
    client.guilds
      .fetch(db.data.guild_id)
      .then((guild) => guild.roles.fetch(id))
      .catch(() => null),
  ),
  Menu: {
    Channel: createDiscordAccessor("commands_channel", (id) =>
      fetchChannel(id, ChannelType.GuildText),
    ),
    Message: createDiscordAccessor("jam_menu_message", (id) =>
      fetchMessage(db.data.commands_channel, id),
    ),
  },
  TeamsList: {
    Channel: createDiscordAccessor("teams_channel", (id) =>
      fetchChannel(id, ChannelType.GuildForum),
    ),
    Message: createDiscordAccessor("teams_channel", (id) =>
      fetchMessage(db.data.teams_channel, id),
    ),
  },
};

// this gets only the keys that contain string value
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type DiscordAccessor<T> = {
  get(): Promise<T | null>;
  set(value: T): void;
};

function createDiscordAccessor<
  T extends { id: string },
  K extends StringKeys<Data>,
>(key: K, fetcher: (id: string) => Promise<T | null>): DiscordAccessor<T> {
  return {
    async get(): Promise<T | null> {
      const id = db.data[key];
      if (!id) return null;
      return await fetcher(id);
    },
    async set(value: T) {
      await db.update((data) => {
        data[key] = value.id;
      });
    },
  };
}

// helper function to fetch channel with type checking
async function fetchChannel(id: string, type: ChannelType) {
  const channel = await client.channels.fetch(id);
  if (!channel) return null;
  if (channel.type !== type) {
    console.error(`Channel is not of type ${type}, how did it get here?`);
    return null;
  }
  return channel;
}

// helper function to fetch message
async function fetchMessage(channelId: string, messageId: string) {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) return null;
  return await channel.messages.fetch(messageId);
}
