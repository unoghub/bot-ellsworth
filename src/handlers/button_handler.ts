import Buttons from "@/components/buttons.js";
import type { ExtendedClient } from "@/types/client.js";
import type { ButtonInteraction, CacheType } from "discord.js";

export default async function handle(client: ExtendedClient, interaction: ButtonInteraction<CacheType>) {
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