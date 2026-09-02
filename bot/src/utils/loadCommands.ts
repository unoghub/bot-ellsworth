import { Collection } from "discord.js";
import commandsIndex from "../commands/index.js";
import type { Command, CommandHandler } from "types/command.js";

export default function (): Collection<string, CommandHandler> {
    const commands = new Collection<string, CommandHandler>;

    commandsIndex.forEach((command: Command) => {
        commands.set(command.data.name, command.execute);
    });

    return commands;
};