import type ExtendedClient from "types/client.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default async function (client: ExtendedClient, interaction: ChatInputCommandInteraction) {
    const execute = client.commands.get(interaction.commandName);
    
    if (!execute) {
        console.error("No matching command found!");
        return;
    }

    try {
        await execute(client, interaction);
    } catch (error) {
        console.error(error);
    }
};