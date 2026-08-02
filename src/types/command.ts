import {
    type ChatInputCommandInteraction,
    type SharedSlashCommand,
} from "discord.js";

export type CommandHandler = (interaction: ChatInputCommandInteraction)
    => Promise<void>;

export interface Command {
    data: SharedSlashCommand;
    execute: CommandHandler;
}
