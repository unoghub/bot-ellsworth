import {
  Colors,
  Events,
  Role,
  User,
  type Interaction,
  type RepliableInteraction,
} from "discord.js";
import { GamejamData } from "./gamejam_data.js";
import { client } from "./client.js";

client.on(Events.GuildMemberAdd, async (member) => {
  const isParticipant = GamejamData.Participants.get(member.user);

  if (isParticipant) {
    const role = await GamejamData.JammerRole.get();
    if (!role) return;
    await member.roles.add(role).catch(() => null);
  }
});

client.on(Events.GuildRoleDelete, async (role) => {
  if (role.id !== (await GamejamData.JammerRole.rawget())) return;
  console.log("oh my god the role got deleted");
  GamejamData.JammerRole.clear();
});

export async function addJammerRoleToUser(
  interaction: RepliableInteraction,
  user: User,
): Promise<void> {
  if (!interaction.guild) throw new Error("No guild");
  const role = await GamejamData.JammerRole.get();
  if (!role) throw new Error("no role");
  const member = await interaction.guild.members.fetch(user).catch(() => null);
  if (!member) throw new Error("user not a member");

  member.roles.add(role);
}

export async function removeJammerRoleFromUser(
  interaction: RepliableInteraction,
  user: User,
): Promise<void> {
  if (!interaction.guild) throw new Error("No guild");
  const role = await GamejamData.JammerRole.get();
  if (!role) throw new Error("no role");
  const member = await interaction.guild.members.fetch(user).catch(() => null);
  if (!member) throw new Error("user not a member");

  member.roles.remove(role);
}

export async function createRole(interaction: Interaction): Promise<Role> {
  const existingRole = await GamejamData.JammerRole.get();

  if (existingRole) {
    console.log("Jammer role already exists");
    return existingRole;
  }

  if (!interaction.guild) throw new Error("Interaction is not from a guild.");

  const role = await interaction.guild.roles.create({
    name: "Jammer",
    colors: {
      primaryColor: Colors.Blurple,
    },
    reason: "Jammer role for Game Jam",
  });
  GamejamData.JammerRole.set(role);

  return role;
}
