import { type Command, type CommandHandler } from "@/types/types.js";
import { Collection } from "discord.js"

export function loadCommands(commands: Command[]): Collection<string, CommandHandler> {
    var commands_collection = new Collection<string, CommandHandler>();
    
    for (const command of commands) {
        commands_collection.set(command.data.name, command.execute);
    }

    return commands_collection;
}