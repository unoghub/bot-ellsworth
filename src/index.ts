import { env } from "./env.js";
import { BaseInteraction, Events, type Interaction } from "discord.js";
import commandsIndex from "./commands/index.js";
import type { BaseHandler, CommandHandler } from "./types/handlers.js";
import { client } from "./services/client.js";
import { setup } from "./services/gamejam_service.js";
import buttonRegistry from "./services/buttonRegistry.js";

const commands = new Map<string, CommandHandler>();

for (const command of commandsIndex) {
  commands.set(command.data.name, command.execute);
}

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  setup();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const handler = commands.get(interaction.commandName);
    return handler?.(interaction);
  }

  if (interaction.isButton()) {
    const handler = buttonRegistry.get(interaction.customId);
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
