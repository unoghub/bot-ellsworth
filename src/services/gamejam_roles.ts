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
import { update_team_channels } from "./gamejam_teams.js";

client.on(Events.GuildMemberAdd, async (member) => {
  const isParticipant = GamejamData.Participants.get(member.user);

  if (isParticipant) {
    const role = await GamejamData.JammerRole.get();
    if (!role) return;
    await member.roles.add(role).catch(() => null);

    const team = await GamejamData.Participants.get_team(member.user);
    if (team) {
      update_team_channels(team);
    }
  }
});

client.on(Events.GuildRoleDelete, async (role) => {
  if (role.id === (await GamejamData.JammerRole.rawget())) {
    console.log("oh my god the role got deleted");
    GamejamData.JammerRole.clear();
  } else if (role.id === (await GamejamData.OperatorRole.rawget())) {
    console.log("oh my god the operator role got deleted");
    GamejamData.OperatorRole.clear();
  }
});

export async function addJammerRoleToUser(user: User): Promise<void> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("No guild");
  const role = await GamejamData.JammerRole.get();
  if (!role) throw new Error("no role");
  const member = await guild.members.fetch(user).catch(() => null);
  if (!member) throw new Error("user not a member");

  member.roles.add(role);
}

export async function removeJammerRoleFromUser(user: User): Promise<void> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("No guild");
  const role = await GamejamData.JammerRole.get();
  if (!role) throw new Error("no role");
  const member = await guild.members.fetch(user).catch(() => null);
  if (!member) throw new Error("user not a member");

  member.roles.remove(role);
}

export async function createJammerRole(
  interaction: Interaction,
): Promise<Role> {
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

export async function createOperatorRole(
  interaction: Interaction,
): Promise<Role> {
  const existingRole = await GamejamData.OperatorRole.get();

  if (existingRole) {
    console.log("Operator role alreaedy exists");
    return existingRole;
  }

  if (!interaction.guild) throw new Error("Interaction is not from a guild.");

  const role = await interaction.guild.roles.create({
    name: "Game Jam Operator",
    colors: {
      primaryColor: Colors.Red,
    },
    reason: "Operator role for Game Jam",
  });
  GamejamData.OperatorRole.set(role);

  return role;
}
