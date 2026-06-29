import { setGameJamCmdsChannel } from "@/services/gamejam_data.js";
import { type Command } from "@/types/command.js";
import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set-jam-cmds-channel")
    .setDescription("Set jam commands channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Must be a text channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel", true);

    if (channel.type !== ChannelType.GuildText) {
      interaction.reply({
        content: "Please provide a forum channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await setGameJamCmdsChannel(channel as TextChannel);

    interaction.reply({
      content: "Channel set",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
