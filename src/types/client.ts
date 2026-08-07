import { Client, Collection, type ClientOptions } from "discord.js";
import { type Config, type CommandHandler } from "@/types/types.js";

export class ExtendedClient extends Client {
    config: Config
    commands: Collection<string, CommandHandler>
    // Original Message Id => Mirror Message Id
    announcements: Collection<string, string> 

    constructor(options: ClientOptions) {
        super(options);

        this.announcements = new Collection<string, string>();
    }
}