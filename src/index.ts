import { env } from "./env.js";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

import fs from "fs";
import { pathToFileURL } from "url";
import { join } from "path";

declare module "discord.js" {
  export interface Client {
    commands: Collection<unknown, any>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();

const commandsFolderPath: string = join(import.meta.dirname, "commands");
const commandsFiles: string[] = fs.readdirSync(commandsFolderPath);

for (const file of commandsFiles) {
  const filePath = join(commandsFolderPath, file);

  const { default: command } = await import(pathToFileURL(filePath).href);

  client.commands.set(command.data.name, command.execute);
}

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const execute = interaction.client.commands.get(interaction.commandName);

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

  client.user?.setStatus("invisible");
  client.destroy();
  process.exit(0);
});

client.login(env.TOKEN);
