import ExtendedClient from "types/client.js";
import Config from "types/config.js";
import { type Command } from "types/command.js";
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { Configure } from "./meta/index.js";

const config = Config.load();

export default {
    data: Configure(config),
    async execute(client, interaction) {
        const eclient = client as ExtendedClient;
        const config = eclient.config;

        const key = interaction.options.getString("key");
        const value = interaction.options.getString("value");

        let message_content = "W.I.P.";

        switch (interaction.options.getSubcommand()) {
            case "get":
                message_content = `Value of ${key} is ${config.get(key!)}`;
                break;
            case "set":
                config.set(key!, value);
                message_content = `Value of ${key} is now ${value}`;
                break;
            case "save":
                Config.save();
                message_content = `Config has been saved.`;
                break;
        }

        interaction.reply({
            content: message_content,
            flags: MessageFlags.Ephemeral
        });
    },
} satisfies Command;
