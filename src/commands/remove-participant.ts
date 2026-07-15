import { GamejamData } from "@/services/gamejam_data.js";
import { leave_jam } from "@/services/gamejam_teams.js";
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
    .setName("remove_from_jam")
    .setDescription("Removes user from the jam.")
    .addUserOption((option) =>
      option.setName("user").setDescription("user").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for removing the user.")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
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
      return;
    }

    const target_user: User = interaction.options.getUser("user", true);
    if (!GamejamData.Participants.exists(target_user)) {
      await interaction.reply({
        content: `User ${target_user.tag} is not a participant.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const reason: string | null = interaction.options.getString(
      "reason",
      false,
    );
    leave_jam(target_user);

    target_user
      .send(
        `You have been removed from the game jam.${reason ? ` Reason: ${reason}` : ""}`,
      )
      .catch(() => {
        console.log(`Failed to send DM to ${target_user.tag}`);
      });

    await interaction.reply({
      content: `User ${target_user.tag} has been removed.${reason ? ` Reason: ${reason}` : ""}`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
