import type { ExtendedClass } from "@/types/client.js";
import { type Command } from "@/types/command.js";
import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription("Null")
        .addSubcommand(
            subcmd => subcmd.setName("get").setDescription("Get from config")
                .addStringOption(option => option.setName("key").setDescription("Field key").setRequired(true))
        )
        .addSubcommand(
            subcmd => subcmd.setName("set").setDescription("Set to config")
        ),
    async execute(interaction) {
        const config = (interaction.client as ExtendedClass).config;
        const subcmd = interaction.options.getSubcommand();

        const key = interaction.options.getString("key");
        const value = interaction.options.getString("value");

        let message_content = "";

        if (subcmd === "get") {
            message_content = `Value of ${key} is ${config.get(key!)}`;
        }

        if (subcmd == "set") {
            message_content = `W.I.P.`;
        }

        interaction.reply({
            content: message_content,
            flags: MessageFlags.Ephemeral
        });
    },
} satisfies Command;
