import {
    type ChatInputCommandInteraction,
    type SharedSlashCommand,
} from "discord.js";
import type { ExtendedClient } from "./client.js";

export type CommandHandler = (client: ExtendedClient, interaction: ChatInputCommandInteraction)
    => Promise<void>;

export interface Command {
    data: SharedSlashCommand;
    execute: CommandHandler;
}
