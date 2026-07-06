import { ChannelType, DiscordAPIError, User } from "discord.js";
import { client } from "./client.js";

import { DatabaseSync, type SQLOutputValue } from "node:sqlite";
import { boolean } from "zod";

const db = new DatabaseSync("data/gamejam.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL

  );
  
  CREATE TABLE IF NOT EXISTS jammer_blacklist (
    id TEXT PRIMARY KEY,
    reason TEXT 
  );
  
  CREATE TABLE IF NOT EXISTS jam_teams (
    id TEXT PRIMARY KEY,
    team_name TEXT NOT NULL,
    control_channel TEXT NOT NULL,
    buttons_message TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    
    PRIMARY KEY (team_id, user_id),

    FOREIGN KEY (team_id) REFERENCES jam_teams(id),
    FOREIGN KEY (user_id) REFERENCES participants(id)
  );
`);

function getConfig(key: string): string | null {
  const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as
    { value: string } | undefined;
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
  Participants: createUserTableAccessor<{
    legal_name: string;
  }>("participants"),

  Blacklist: createUserTableAccessor<{
    reason: string | null;
  }>("jammer_blacklist"),
  ready: true,
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

function createUserTableAccessor<T extends Record<string, SQLOutputValue>>(
  table: string,
) {
  return {
    set(user: User, values: T) {
      const columns = Object.keys(values);
      const params = Object.values(values);

      const sql = `
        INSERT INTO ${table}
          (id, ${columns.join(", ")})
        VALUES
          (?, ${columns.map(() => "?").join(", ")})
        ON CONFLICT(id) DO UPDATE SET
          ${columns.map((c) => `${c} = excluded.${c}`).join(", ")}
      `;

      db.prepare(sql).run(user.id, ...params);
    },

    get(user: User): ({ id: string } & T) | null {
      return (
        (db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(user.id) as
          ({ id: string } & T) | undefined) ?? null
      );
    },

    remove(user: User) {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(user.id);
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
