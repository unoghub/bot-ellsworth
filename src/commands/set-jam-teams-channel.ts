import { setGameJamTeamsChannel } from "@/services/gamejam_data.js";
import { type Command } from "@/types/command.js";
import {
  ChannelType,
  ForumChannel,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set-jam-teams-channel")
    .setDescription("Set jam teams channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Must be a forum")
        .addChannelTypes(ChannelType.GuildForum)
        .setRequired(true),
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel", true);

    if (channel.type !== ChannelType.GuildForum) {
      interaction.reply({
        content: "Please provide a forum channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await setGameJamTeamsChannel(channel as ForumChannel);

    interaction.reply({
      content: "Channel set",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
