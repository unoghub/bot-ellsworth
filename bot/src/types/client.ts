import { Client, Collection, type ClientOptions } from "discord.js";
import Config from "./config.js";
import { type CommandHandler } from "./command.js";

import loadCommands from "utils/loadCommands.js";
import loadEvents from "utils/loadEvents.js";

export default class ExtendedClient extends Client {
    config: Config
    commands: Collection<string, CommandHandler>
    // Original Message Id => Mirror Message Id
    announcements: Collection<string, string> 

    constructor(options: ClientOptions) {
        super(options);

        this.config = Config.load();
        this.commands = loadCommands();
        this.announcements = new Collection<string, string>();
        loadEvents(this);
    }
}