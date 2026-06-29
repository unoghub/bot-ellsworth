import type { ForumChannel, Role, TextChannel } from "discord.js";
import { JSONFilePreset } from "lowdb/node";

type Data = {
  commands_channel: string;
  teams_channel: string;
  jammer_role_id: string;
};

const defaultData: Data = {
  commands_channel: "",
  teams_channel: "",
  jammer_role_id: "",
};
const db = await JSONFilePreset("data/gamejam_variables.json", defaultData);

export async function setGameJamTeamsChannel(channel: ForumChannel) {
  db.data.teams_channel = channel.id;
  await db.write();
}

export async function setGameJamCmdsChannel(channel: TextChannel) {
  db.data.commands_channel = channel.id;
  await db.write();
}

export async function setJammerRole(role: Role) {
  db.data.jammer_role_id = role.id;
  await db.write();
}

export var teams_channel: ForumChannel | null = null;
