import type { ExtendedClass } from "@/types/client.js";
import { type Command } from "@/types/command.js";
import { Config } from "@/types/types.js";
import { SlashCommandBuilder, MessageFlags } from "discord.js";

const config = Config.load();

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription("Manage bot's configuration")
        .addSubcommand(
            subcmd => subcmd.setName("get").setDescription("Get from config")
                .addStringOption(option =>
                    option.setName("key").setDescription("Field key")
                        .setChoices(...Object.entries(config.data).map(e => ({name: e[0], value: e[0]})))
                        .setRequired(true)
                )
        )
        .addSubcommand(
            subcmd => subcmd.setName("set").setDescription("Set to config")
                .addStringOption(option =>
                    option.setName("key").setDescription("Field key").setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("value").setDescription("New value").setRequired(true)
                )
        )
        .addSubcommand(
            subcmd => subcmd.setName("save").setDescription("Save new config")
        ),
    async execute(interaction) {
        const config = (interaction.client as ExtendedClass).config;

        const key = interaction.options.getString("key");
        const value = interaction.options.getString("value");

        let message_content = "";

        switch (interaction.options.getSubcommand()) {
            case "get":
                message_content = `Value of ${key} is ${config.get(key!)}`;
                break;
            case "set":
                config.set(key!, value);
                message_content = `Value of ${key} is now ${value}`;
                break;
        }

        interaction.reply({
            content: message_content,
            flags: MessageFlags.Ephemeral
        });
    },
} satisfies Command;
