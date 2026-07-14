import { client } from "./client.js";

import { DatabaseSync, type SQLOutputValue } from "node:sqlite";
import { env } from "@/env.js";
import {
  ChannelType,
  DiscordAPIError,
  Message,
  ThreadChannel,
  User,
  VoiceChannel,
  type Snowflake,
} from "discord.js";
import { readFileSync } from "node:fs";
import {
  create_control_message,
  create_team_thread,
  create_voice_communication,
  update_team_channels,
} from "./gamejam_teams.js";

const db = new DatabaseSync("data/gamejam.db");
db.exec("PRAGMA journal_mode = WAL");
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
      fetchChannelWithType(id, ChannelType.GuildText),
    ),
    Message: createDiscordAccessor("jam_menu_message", (id) => {
      const channelId = getConfig("commands_channel");
      if (!channelId) return Promise.resolve(null);
      return fetchMessage(channelId, id);
    }),
  },
  TeamsForum: {
    Channel: createDiscordAccessor("teams_channel", (id) =>
      fetchChannelWithType(id, ChannelType.GuildForum),
    ),
  },
  CommunicationsCategory: createDiscordAccessor(
    "jam_communications_category",
    async (id) => {
      const guildId = getConfig("guild_id");
      if (!guildId) throw new Error("no guild");

      const guild = await client.guilds.fetch(guildId);

      if (!guild) throw new Error("no guild");

      const channel = await guild.channels.fetch(id);

      if (!channel) return null;

      if (channel.type !== ChannelType.GuildCategory) {
        console.log("invalid, return null");
        return null;
      }

      return channel;
    },
  ),
  ArchiveCategory: createDiscordAccessor("jam_archive_category", async (id) => {
    const guildId = getConfig("guild_id");
    if (!guildId) throw new Error("no guild");

    const guild = await client.guilds.fetch(guildId);

    if (!guild) throw new Error("no guild");

    const channel = await guild.channels.fetch(id);

    if (!channel) return null;

    if (channel.type !== ChannelType.GuildCategory) {
      console.log("invalid, return null");
      return null;
    }

    return channel;
  }),
  Participants: {
    ...createUserTableAccessor<{
      legal_name: string;
    }>("participants"),

    in_a_team(user: User): boolean {
      const row = db
        .prepare(
          `SELECT COUNT(*) AS count
          FROM team_members
          WHERE user_id = ?`,
        )
        .get(user.id) as { count: number };

      return row.count > 0;
    },
    async get_team(user: User): Promise<GamejamTeam | null> {
      const row = db
        .prepare(`SELECT team_id FROM team_members WHERE user_id = ? LIMIT 1`)
        .get(user.id) as { team_id: string } | undefined;

      if (!row) return null;

      return await GamejamData.Teams.get_from_id(row.team_id);
    },
  },

  Blacklist: createUserTableAccessor<{
    reason: string | null;
  }>("jammer_blacklist"),
  ready: true,

  Teams: {
    set_team(
      teamData: Omit<GamejamTeam, "id"> & { id?: Snowflake },
    ): GamejamTeam {
      var teamId = teamData.id;
      if (teamId === undefined) {
        teamId = `${teamData.owner.id}-${Date.now()}` as Snowflake;
      }
      db.prepare(
        `
        INSERT INTO jam_teams (id, owner_id, team_name, control_channel, buttons_message, voice_channel)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
        owner_id=excluded.owner_id, 
        team_name=excluded.team_name, 
        control_channel=excluded.control_channel, 
        buttons_message=excluded.buttons_message, 
        voice_channel=excluded.voice_channel
      `,
      ).run(
        teamId,
        teamData.owner.id,
        teamData.team_name,
        teamData.thread.id,
        teamData.control_message.id,
        teamData.voice_channel.id,
      );

      db.prepare(
        `
        INSERT INTO team_members (team_id, user_id)
        VALUES (?, ?)
        ON CONFLICT(team_id, user_id) DO NOTHING
        `,
      ).run(teamId, teamData.owner.id);

      const { id, ...rest } = teamData;
      return {
        id: teamId,
        ...rest,
      };
    },

    delete(team: GamejamTeam) {
      db.prepare(`DELETE FROM jam_teams WHERE id = ?`).run(team.id);
    },

    delete_with_id(id: string) {
      db.prepare(`DELETE FROM jam_teams WHERE id = ?`).run(id);
    },

    async get_team_from_thread<T extends boolean = false>(
      thread: ThreadChannel,
      options?: { raw: T },
    ): Promise<T extends true ? RawGamejamTeam | null : GamejamTeam | null> {
      const row = db
        .prepare(`SELECT * FROM jam_teams WHERE control_channel = ?`)
        .get(thread.id) as RawGamejamTeam | undefined;

      if (!row) return null;

      if (options?.raw) {
        return row as T extends true
          ? RawGamejamTeam | null
          : GamejamTeam | null;
      }

      let control_message = await fetchMessage(thread.id, row.buttons_message);
      if (!control_message) {
        control_message = await create_control_message(thread);
        db.prepare(`UPDATE jam_teams SET buttons_message = ? WHERE id = ?`).run(
          control_message.id,
          row.id,
        );
      }

      let voice_channel = (await fetchChannelWithType(
        row.voice_channel,
        ChannelType.GuildVoice,
      )) as VoiceChannel | null;
      if (!voice_channel) {
        voice_channel = await create_voice_communication(row.team_name);
        db.prepare(`UPDATE jam_teams SET voice_channel = ? WHERE id = ?`).run(
          voice_channel.id,
          row.id,
        );
      }

      const out: GamejamTeam = {
        id: row.id,
        owner: await client.users.fetch(row.owner_id),
        team_name: row.team_name,
        thread: thread,
        control_message: control_message,
        voice_channel: voice_channel,
      };

      update_team_channels(out);

      return out as T extends true ? RawGamejamTeam | null : GamejamTeam | null;
    },

    async get_from_id(id: string): Promise<GamejamTeam | null> {
      const row = db.prepare(`SELECT * FROM jam_teams WHERE id = ?`).get(id) as
        RawGamejamTeam | undefined;

      if (!row) return null;

      let thread_message = await fetchChannelWithType(
        row.control_channel,
        ChannelType.PublicThread,
      );
      let control_message;
      if (!thread_message?.isThread()) {
        [thread_message, control_message] = await create_team_thread({
          team_name: row.team_name,
        });
        db.prepare(
          `UPDATE jam_teams SET control_channel = ?, buttons_message = ? WHERE id = ?`,
        ).run(thread_message.id, control_message.id, row.id);
      } else {
        control_message = await fetchMessage(
          thread_message.id,
          row.buttons_message,
        );
        if (!control_message) {
          control_message = await create_control_message(thread_message);
          db.prepare(
            `UPDATE jam_teams SET buttons_message = ? WHERE id = ?`,
          ).run(control_message.id, row.id);
        }
      }

      let voice_channel = (await fetchChannelWithType(
        row.voice_channel,
        ChannelType.GuildVoice,
      )) as VoiceChannel | null;
      if (!voice_channel) {
        voice_channel = await create_voice_communication(row.team_name);
        db.prepare(`UPDATE jam_teams SET voice_channel = ? WHERE id = ?`).run(
          voice_channel.id,
          row.id,
        );
      }

      const out: GamejamTeam = {
        id: row.id,
        owner: await client.users.fetch(row.owner_id),
        team_name: row.team_name,
        thread: thread_message,
        control_message,
        voice_channel,
      };

      update_team_channels(out);

      return out;
    },

    async add_to_team(user: User, team: GamejamTeam) {
      db.prepare(
        `INSERT INTO team_members (team_id, user_id) VALUES (?, ?)`,
      ).run(team.id, user.id);
    },

    user_in_team(user: User, team: GamejamTeam): boolean {
      const row = db
        .prepare(`SELECT 1 FROM team_members WHERE user_id = ? AND team_id = ?`)
        .get(user.id, team.id) as { exists: number } | undefined;

      return Boolean(row);
    },

    leave_team(user: User, team: GamejamTeam) {
      db.prepare(
        `DELETE FROM team_members WHERE user_id = ? AND team_id = ?`,
      ).run(user.id, team.id);
    },

    async get_members(team: GamejamTeam): Promise<User[]> {
      const rows = db
        .prepare(`SELECT user_id FROM team_members WHERE team_id = ?`)
        .all(team.id) as { user_id: string }[];

      return Promise.all(rows.map((row) => client.users.fetch(row.user_id)));
    },

    async raw_get_all(): Promise<RawGamejamTeam[]> {
      const rows = db
        .prepare(`SELECT * FROM jam_teams`)
        .all() as RawGamejamTeam[];
      return rows;
    },
  },

  JoinRequests: {
    add(user: User, team: GamejamTeam, confirmMessage: Message) {
      db.prepare(
        `INSERT INTO join_requests (request_message_id,user_id,team_id) VALUES (?, ?, ?)`,
      ).run(confirmMessage.id, user.id, team.id);
    },
    exists(user: User, team: GamejamTeam): boolean {
      const row = db
        .prepare(
          `SELECT 1 FROM join_requests WHERE user_id = ? AND team_id = ?`,
        )
        .get(user.id, team.id) as { exists: number } | undefined;

      return Boolean(row);
    },
    async pop(message: Message) {
      const row = db
        .prepare(`SELECT * FROM join_requests WHERE request_message_id = ?`)
        .get(message.id) as
        | {
            request_message_id: string;
            user_id: string;
            team_id: string;
          }
        | undefined;

      if (!row) return null;

      const team = await GamejamData.Teams.get_from_id(row.team_id);
      if (!team) throw new Error("no team");
      const user = await client.users.fetch(row.user_id);

      db.prepare(`DELETE FROM join_requests WHERE request_message_id = ?`).run(
        message.id,
      );
      return {
        message,
        user,
        team,
      };
    },
    async clear_user(user: User) {
      db.prepare(`DELETE FROM join_requests WHERE user_id = ?`).run(user.id);
    },
  },
  Submissions: {
    set(data: Submission) {
      db.prepare(
        `INSERT INTO submissions (team_id, game_name, description, game_url)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (team_id) DO 
        UPDATE SET game_name=excluded.game_name, description=excluded.description, game_url=excluded.game_url`,
      ).run(data.team.id, data.game_name, data.description, data.game_url);
    },
    get(team: GamejamTeam): Submission | null {
      const row = db
        .prepare(`SELECT * FROM submissions WHERE team_id = ?`)
        .get(team.id) as
        | {
            team_id: string;
            game_name: string;
            description: string | null;
            game_url: string;
          }
        | undefined;

      if (!row) return null;

      return {
        team,
        game_name: row.game_name,
        description: row.description,
        game_url: row.game_url,
      };
    },
  },
};

export type Submission = {
  team: GamejamTeam;
  game_name: string;
  description: string | null;
  game_url: string;
};

export type GamejamTeam = {
  id: string;
  owner: User;
  team_name: string;
  thread: ThreadChannel;
  control_message: Message;
  voice_channel: VoiceChannel;
};

export type RawGamejamTeam = {
  id: string;
  owner_id: string;
  team_name: string;
  control_channel: string;
  buttons_message: string;
  voice_channel: string;
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

    exists(user: User): boolean {
      const row = db
        .prepare(`SELECT 1 FROM ${table} WHERE id = ?`)
        .get(user.id) as { exists: number } | undefined;

      return Boolean(row);
    },
  };
}

// helper function to fetch channel with type checking
export async function fetchChannelWithType(id: string, type: ChannelType) {
  const channel = await client.channels.fetch(id).catch((err: unknown) => {
    if (err instanceof DiscordAPIError && err.code === 10003) {
      return null;
    }
    throw err;
  });
  if (!channel || channel.type !== type) {
    return null;
  }
  return channel;
}

export async function fetchChannel(id: string) {
  const channel = await client.channels.fetch(id).catch((err: unknown) => {
    if (err instanceof DiscordAPIError && err.code === 10003) {
      return null;
    }
    throw err;
  });

  return channel;
}

// helper function to fetch message
export async function fetchMessage(
  channelId: string,
  messageId: string,
): Promise<Message | null> {
  const channel = await fetchChannel(channelId);

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
