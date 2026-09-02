import type ExtendedClient from "types/client.js";
import type { ButtonInteraction } from "discord.js";
import { Buttons } from "components/index.js";

export default async function (client: ExtendedClient, interaction: ButtonInteraction) {
    const handler = Buttons.get(interaction.customId)?.handle;

    if (!handler) {
        console.error("No matching handler found!");
        return;
    }

    try {
        await handler(client, interaction);
    } catch (error) {
        console.error(error);
    }
}