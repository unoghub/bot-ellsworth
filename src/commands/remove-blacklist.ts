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
    .setName("unblacklist")
    .setDescription("Removes user from jam blacklist.")
    .addUserOption(
      new SlashCommandUserOption().setName("user").setRequired(true),
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
    if (!GamejamData.Blacklist.exists(target_user)) {
      await interaction.reply({
        content: `User ${target_user.tag} is not blacklisted.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    GamejamData.Blacklist.remove(target_user);
    target_user
      .send(`You have been pardoned. You can now join the jam again.`)
      .catch(() => {
        console.log(`Failed to send DM to ${target_user.tag}`);
      });

    await interaction.reply({
      content: `User ${target_user.tag} has been removed from the blacklist.`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
