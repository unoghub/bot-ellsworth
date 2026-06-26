import { env } from "../src/env.js";
import { REST, Routes } from "discord.js";

import commandsIndex from "../src/commands/index.js";

const commands = commandsIndex.map((cmd) => cmd.data.toJSON());

const rest = new REST().setToken(env.TOKEN);

(async () => {
  try {
    console.log(`Refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
