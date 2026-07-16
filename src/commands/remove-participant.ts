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
    .setDescription("Kullanıcıyı jam'den çıkarır.")
    .addUserOption((option) =>
      option.setName("user").setDescription("kullanıcı").setRequired(true),
    )
    .addStringOption((option) =>
      option
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
    if (!GamejamData.Participants.exists(target_user)) {
      await interaction.reply({
        content: `${target_user.tag} kullanıcısı bir katılımcı değil.`,
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
        `Game jam'den çıkarıldınız.${reason ? ` Sebep: ${reason}` : ""}`,
      )
      .catch(() => {
        console.log(`Failed to send DM to ${target_user.tag}`);
      });

    await interaction.reply({
      content: `${target_user.tag} kullanıcısı çıkarıldı.${reason ? ` Sebep: ${reason}` : ""}`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
