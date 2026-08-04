
import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, type CacheType, type Interaction } from "discord.js";

export const event: Event<Events.InteractionCreate> = {
    event: Events.InteractionCreate,
    once: false,
    async handle(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client as ExtendedClient;

        const execute = client.commands.get(interaction.commandName);

        if (!execute) {
            console.error("No matching command found!");
            return;
        }

        try {
            await execute(interaction, client);
        } catch (error) {
            console.error(error);
        }
    }
}