import { GamejamData, type GamejamTeam } from "@/services/gamejam_data.js";
import { leave_team } from "@/services/gamejam_teams.js";
import { type Command } from "@/types/command.js";
import {
  GuildMember,
  MessageFlags,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption,
  User,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("remove_from_team")
    .setDescription("Removes user from the jam team.")
    .addUserOption(
      new SlashCommandUserOption().setName("user").setRequired(true),
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("reason")
        .setDescription("Reason for removing the user.")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const operator_role: Role | null = await GamejamData.OperatorRole.get();
    if (!operator_role) {
      await interaction.reply({
        content: "Operator role is not set. Please set it first.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    if (!member.roles.cache.has(operator_role.id)) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const target_user: User = interaction.options.getUser("user", true);
    const team: GamejamTeam | null =
      await GamejamData.Participants.get_team(target_user);
    if (!team) {
      await interaction.reply({
        content: `User ${target_user.tag} is not in a team.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const reason: string | null = interaction.options.getString(
      "reason",
      false,
    );
    leave_team(target_user, team);

    target_user
      .send(
        `You have been removed from the team \`${team.team_name}\`.${reason ? ` Reason: ${reason}` : ""}`,
      )
      .catch(() => {
        console.log(`Failed to send DM to ${target_user.tag}`);
      });

    await interaction.reply({
      content: `User ${target_user.tag} has been removed from the team \`${team.team_name}\`.`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
