import { type ChatInputCommandInteraction, type SlashCommandBuilder } from "discord.js";

type CommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;

export interface Command {
    data: SlashCommandBuilder,
    execute: CommandHandler
};