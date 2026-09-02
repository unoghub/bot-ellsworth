import {
    ChatInputCommandInteraction, Client, SharedSlashCommand
} from "discord.js";

export type CommandHandler = (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>;

export type CommandMetadata = SharedSlashCommand;

export interface Command {
    data: CommandMetadata,
    execute: CommandHandler
};