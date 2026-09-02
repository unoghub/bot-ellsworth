import { SlashCommandBuilder } from "discord.js";
import type { CommandMetadata } from "types/command.js";
import type Config from "types/config.js";

export const Ping = () =>
    new SlashCommandBuilder()
        .setName("ping").setDescription("Check ping.") satisfies CommandMetadata;

export const Verification = () =>
    new SlashCommandBuilder()
        .setName('verification')
        .setDescription("Manage bot's verification process")
        .addSubcommand(
            subcmd => subcmd
                .setName("create_form_button")
                .setDescription("Create a form for verification")
        ) satisfies CommandMetadata;

export const Configure = (config: Config) =>
    new SlashCommandBuilder()
        .setName('config')
        .setDescription("Manage bot's configuration")
        .addSubcommand(
            subcmd => subcmd.setName("get").setDescription("Get from config")
                .addStringOption(option =>
                    option.setName("key").setDescription("Field key")
                        .setChoices(...Object.entries(config.data).map(e => ({ name: e[0], value: e[0] })))
                        .setRequired(true)
                )
        )
        .addSubcommand(
            subcmd => subcmd.setName("set").setDescription("Set to config")
                .addStringOption(option =>
                    option.setName("key").setDescription("Field key")
                        .setChoices(...Object.entries(config.data).map(e => ({ name: e[0], value: e[0] })))
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("value").setDescription("New value").setRequired(true)
                )
        )
        .addSubcommand(
            subcmd => subcmd.setName("save").setDescription("Save new config")
        ) satisfies CommandMetadata;