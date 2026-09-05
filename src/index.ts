import env from "./env.js";
import { GatewayIntentBits, Partials } from "discord.js";
import { ExtendedClient } from "@/types/types.js";
import commands from "./commands/index.js";
import events from "./events/index.js";
import { loadCommands } from "./util/loader.js";

const client = new ExtendedClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message
    ]
});

client.commands = loadCommands(commands);

for (const event of events) {
    client.on(event.event as any, (...args: any[]) => (event.handle as any)(...args));
}

process.on("SIGINT", async () => {
    console.log("Goodbye, Ellsworth!");

    client.user?.setPresence({ status: "invisible" });
    client.destroy();
    process.exit(0);
});

client.login(env.TOKEN);
