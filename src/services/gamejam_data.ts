import { client } from "./client.js";

import { DatabaseSync, type SQLOutputValue } from "node:sqlite";
import { env } from "@/env.js";
import {
  ChannelType,
  DiscordAPIError,
  Message,
  ThreadChannel,
  User,
  type Snowflake,
} from "discord.js";
import { readFileSync } from "node:fs";

const db = new DatabaseSync("data/gamejam.db");
db.exec("PRAGMA foreign_keys = ON;");
const schema = readFileSync("sql/init.sql", "utf8");
db.exec(schema);

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

function clearConfig(key: string) {
  db.prepare("DELETE FROM config WHERE key = ?").run(key);
}

export const GamejamData = {
  Guild: createDiscordAccessor("guild_id", async (id) => {
    const guild = await client.guilds.fetch(id);
    if (!guild) {
      //fallback guild found in .env
      return client.guilds.fetch(env.GUILD_ID);
    }
    return guild;
  }),
  JammerRole: createDiscordAccessor("jammer_role_id", async (id) => {
    const guildId = getConfig("guild_id");
    if (!guildId) throw new Error("no guild");

    return client.guilds.fetch(guildId).then((guild) => guild.roles.fetch(id));
  }),
  OperatorRole: createDiscordAccessor("operator_role_id", async (id) => {
    const guildId = getConfig("guild_id");
    if (!guildId) throw new Error("no guild");

    return client.guilds.fetch(guildId).then((guild) => guild.roles.fetch(id));
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
  TeamsForum: {
    Channel: createDiscordAccessor("teams_channel", (id) =>
      fetchChannel(id, ChannelType.GuildForum),
    ),
  },
  Participants: {
    ...createUserTableAccessor<{
      legal_name: string;
    }>("participants"),

    user_in_a_team(user: User): boolean {
      const row = db
        .prepare(
          `SELECT COUNT(*) AS count
          FROM team_members
          WHERE user_id = ?`,
        )
        .get(user.id) as { exists: number };

      return Boolean(row.exists);
    },
  },

  Blacklist: createUserTableAccessor<{
    reason: string | null;
  }>("jammer_blacklist"),
  ready: true,
  Teams: {
    create_team(teamData: Omit<GamejamTeam, "id">): string {
      const teamId = `${teamData.owner.id}-${Date.now()}` as Snowflake;
      db.prepare(
        `
        INSERT INTO jam_teams (id, owner_id, team_name, control_channel, buttons_message)
        VALUES (?, ?, ?, ?, ?)
      `,
      ).run(
        teamId,
        teamData.owner.id,
        teamData.team_name,
        teamData.thread.id,
        teamData.control_message.id,
      );

      db.prepare(
        `
        INSERT INTO team_members (team_id, user_id)
        VALUES (?, ?)
        `,
      ).run(teamId, teamData.owner.id);

      return teamId;
    },
  },
};

export type GamejamTeam = {
  id: string;
  owner: User;
  team_name: string;
  thread: ThreadChannel;
  control_message: Message;
};

type DiscordAccessor<T> = {
  cache: T | null;
  get(options?: { force?: boolean }): Promise<T | null>;
  rawget(): Promise<string | null>;
  set(value: T): void;
  clear(): Promise<void>;
};

function createDiscordAccessor<T extends { id: string }>(
  key: string,
  fetcher: (id: string) => Promise<T | null>,
): DiscordAccessor<T> {
  return {
    cache: null,
    async get({ force = false } = {}) {
      if (!force && this.cache) return this.cache;
      const id = getConfig(key);
      if (!id) return null;
      const out = await fetcher(id);
      if (!out) return null;
      this.cache = out;
      return out;
    },
    set(value: T) {
      this.cache = value;
      setConfig(key, value.id);
    },
    async rawget() {
      return getConfig(key);
    },
    async clear() {
      this.cache = null;
      clearConfig(key);
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

    async get_all(): Promise<User[]> {
      const rows = db.prepare(`SELECT id FROM ${table}`).all() as {
        id: string;
      }[];

      return (
        await Promise.all(
          rows.map((row) => client.users.fetch(row.id).catch(() => null)),
        )
      ).filter((user): user is User => user !== null);
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
async function fetchMessage(
  channelId: string,
  messageId: string,
): Promise<Message | null> {
  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isTextBased())
    throw new Error("channel not text based");

  try {
    return await channel.messages.fetch(messageId);
  } catch (error) {
    if (
      error instanceof DiscordAPIError &&
      error.code === 10008 // Unknown Message
    )
      return null;

    throw error;
  }
}
