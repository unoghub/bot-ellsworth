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
    .setDescription("Kullanıcıyı jam yasak listesinden çıkarır.")
    .addUserOption((option) =>
      option.setName("user").setDescription("kullanıcı").setRequired(true),
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
    if (!GamejamData.Blacklist.exists(target_user)) {
      await interaction.reply({
        content: `${target_user.tag} kullanıcısı yasaklı değil.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    GamejamData.Blacklist.remove(target_user);
    target_user
      .send(`Affedildiniz. Jam'e tekrar katılabilirsiniz.`)
      .catch(() => {
        console.log(`Failed to send DM to ${target_user.tag}`);
      });

    await interaction.reply({
      content: `${target_user.tag} kullanıcısı yasak listesinden çıkarıldı.`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
