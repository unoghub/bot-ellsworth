import { env } from "./env.js";
import { Collection, Events, GatewayIntentBits } from "discord.js";
import commandsIndex from "./commands/index.js";
import { ExtendedClient, Config, type CommandHandler } from "@/types/types.js";
import { saveConfig } from "./util/loader.js";

const client = new ExtendedClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]}, 
    Config.load()
);

var commands = new Collection<string, CommandHandler>();

for (const command of commandsIndex) {
    commands.set(command.data.name, command.execute);
}

client.on(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const execute = commands.get(interaction.commandName);

    if (!execute) {
        console.error("No matching command found!");
        return;
    }

    try {
        await execute(interaction);
    } catch (error) {
        console.error(error);
    }
});

process.on("SIGINT", async () => {
    console.log("Goodbye, Ellsworth!");

    client.user?.setPresence({ status: "invisible" });
    client.destroy();
    process.exit(0);
});

client.login(env.TOKEN);
