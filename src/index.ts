import { env } from "./env.js";
import { Events } from "discord.js";
import commandsIndex from "./commands/index.js";
import { client } from "./services/client.js";
import {
  buttonRegistry,
  commandsRegistry,
  modalRegistry,
} from "./services/registry.js";

for (const command of commandsIndex) {
  commandsRegistry.set(command.data.name, command.execute);
}

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const handler = commandsRegistry.get(interaction.commandName);
    return handler?.(interaction);
  }

  if (interaction.isButton()) {
    const handler = buttonRegistry.get(interaction.customId);
    return handler?.(interaction);
  }

  if (interaction.isModalSubmit()) {
    const handler = modalRegistry.get(interaction.customId);
    return handler?.(interaction);
  }
});

process.on("SIGINT", async () => {
  console.log("Goodbye, Ellsworth!");

  client.user?.setPresence({ status: "invisible" });
  client.destroy();
  process.exit(0);
});

client.login(env.TOKEN);
