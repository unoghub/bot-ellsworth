import { ChannelType, DiscordAPIError } from "discord.js";
import { client } from "./client.js";

import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/gamejam.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY
  );
  
  CREATE TABLE IF NOT EXISTS jammer_blacklist (
    id TEXT PRIMARY KEY,
    reason TEXT 
  );
  
  CREATE TABLE IF NOT EXISTS jam_teams (
    team_name TEXT PRIMARY KEY,
    control_channel TEXT NOT NULL,
    buttons_message TEXT NOT NULL
  );
`);

function getConfig(key: string): string | null {
  const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

function setConfig(key: string, value: string) {
  db.prepare(
    `
    INSERT INTO config (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `,
  ).run(key, value);
}

export const GamejamData = {
  Guild: createDiscordAccessor("guild_id", (id) => client.guilds.fetch(id)),
  JammerRole: createDiscordAccessor("jammer_role_id", async (id) => {
    const guildId = getConfig("guild_id");
    if (!guildId) return null;

    return client.guilds
      .fetch(guildId)
      .then((guild) => guild.roles.fetch(id))
      .catch(() => null);
  }),
  Menu: {
    Channel: createDiscordAccessor("commands_channel", (id) =>
      fetchChannel(id, ChannelType.GuildText),
    ),
    Message: createDiscordAccessor("jam_menu_message", (id) => {
      const channelId = getConfig("commands_channel");
      if (!channelId) return Promise.resolve(null);
      return fetchMessage(channelId, id);
    }),
  },
  TeamsList: {
    Channel: createDiscordAccessor("teams_channel", (id) =>
      fetchChannel(id, ChannelType.GuildForum),
    ),
  },
};

type DiscordAccessor<T> = {
  get(): Promise<T | null>;
  set(value: T): Promise<void>;
};

function createDiscordAccessor<T extends { id: string }>(
  key: string,
  fetcher: (id: string) => Promise<T | null>,
): DiscordAccessor<T> {
  return {
    async get() {
      const id = getConfig(key);
      if (!id) return null;
      return await fetcher(id);
    },
    async set(value: T) {
      setConfig(key, value.id);
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
  return await channel.messages.fetch(messageId).catch((error: unknown) => {
    if (error instanceof DiscordAPIError && error.code === 10008) return null;
    throw error;
  });
}
