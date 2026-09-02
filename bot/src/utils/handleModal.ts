import type ExtendedClient from "types/client.js";
import type { ModalSubmitInteraction } from "discord.js";
import { Modals } from "components/index.js";

export default async function (client: ExtendedClient, interaction: ModalSubmitInteraction) {
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