import config from '@config';
import { REST, Routes } from 'discord.js';

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const commands: any[] = [];

const commandsFolderPath = path.join(import.meta.dirname, '../src/commands');
const commandsFiles = fs.readdirSync(commandsFolderPath);

for (const file of commandsFiles) {
    const filePath = path.join(commandsFolderPath, file);

    const { default: command } = await import(pathToFileURL(filePath).href);
    
    commands.push(command.data.toJSON());
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`Refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(config.client_id, config.guild_id), 
            { body: commands });

        console.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
