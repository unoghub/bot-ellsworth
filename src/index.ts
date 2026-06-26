import { env } from "./env.js";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import commandsIndex from "./commands/index.js";
import type { CommandHandler } from "./command.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
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
