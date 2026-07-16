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
    .setDescription("Kullanıcıyı jam ekibinden çıkarır.")
    .addUserOption((option) =>
      option.setName("user").setDescription("kullanıcı").setRequired(true),
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("reason")
        .setDescription("Kullanıcıyı çıkarma sebebi.")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
  async execute(interaction) {
    const operator_role: Role | null = await GamejamData.OperatorRole.get();
    if (!operator_role) {
      await interaction.reply({
        content: "Operatör rolü ayarlanmamış. Lütfen önce bunu ayarlayın.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    if (!member.roles.cache.has(operator_role.id)) {
      await interaction.reply({
        content: "Bu komutu kullanma izniniz yok.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const target_user: User = interaction.options.getUser("user", true);
    const team: GamejamTeam | null =
      await GamejamData.Participants.get_team(target_user);
    if (!team) {
      await interaction.reply({
        content: `${target_user.tag} kullanıcısı bir ekipte değil.`,
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
        `\`${team.team_name}\` ekibinden çıkarıldınız.${reason ? ` Sebep: ${reason}` : ""}`,
      )
      .catch(() => {
        console.log(`Failed to send DM to ${target_user.tag}`);
      });

    await interaction.reply({
      content: `${target_user.tag} kullanıcısı \`${team.team_name}\` ekibinden çıkarıldı.`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
