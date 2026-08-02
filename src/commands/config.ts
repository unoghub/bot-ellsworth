import type { ExtendedClass } from "@/types/client.js";
import { type Command } from "@/types/command.js";
import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription("Null")
        .addStringOption(option => option.setName("key").setDescription("Null"))
        .addStringOption(option => option.setName("value").setDescription("Null")),
    async execute(interaction) {
        let key = interaction.options.getString("key");
        let value = interaction.options.getString("value");
        if (key && value) {
            (interaction.client as ExtendedClass).config[key] = value;

            interaction.reply({
                content: `Updated config. ${key} to ${value}`,
                flags: MessageFlags.Ephemeral
            });
        }
    },
} satisfies Command;
