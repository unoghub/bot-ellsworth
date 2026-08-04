import Modals from "@/components/modals.js";

import type { ExtendedClient } from "@/types/client.js";
import type { CacheType, ModalSubmitInteraction } from "discord.js";

export default async function handle(client: ExtendedClient, interaction: ModalSubmitInteraction<CacheType>) {
    const handler = Modals.get(interaction.customId)?.handle;

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