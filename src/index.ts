import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, async (message) => {
  console.log(message);
  if (message.content === "lan") {
    await message.reply("Lan mı?!");
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(interaction);

  if (interaction.commandName === "lan") {
    await interaction.reply("Lan mı?!");
  }
});

process.on("SIGINT", async () => {
  console.log("Goodbye, Ellsworth!");

  client.user?.setStatus("invisible");
  client.destroy();
  process.exit(0);
});

client.login(process.env.TOKEN);
