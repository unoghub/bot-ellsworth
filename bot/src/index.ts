import env from "utils/env.js";

import { GatewayIntentBits, Partials } from "discord.js";
import ExtendedClient from "types/client.js";

const client = new ExtendedClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message
    ]
});

process.on("SIGINT", async () => {
    console.log("Goodbye, Pengu!");

    client.user?.setPresence({ status: "invisible" });
    client.destroy();
    process.exit(0);
});

client.login(env.TOKEN);