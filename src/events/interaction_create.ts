
import commandHandler from "@/handlers/command_handler.js";
import buttonHandler from "@/handlers/button_handler.js";
import modalHandler from "@/handlers/modal_handler.js";

import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, type CacheType, type Interaction } from "discord.js";

export const event: Event<Events.InteractionCreate> = {
    event: Events.InteractionCreate,
    once: false,
    async handle(interaction: Interaction<CacheType>) {

        const client = interaction.client as ExtendedClient;

        if (interaction.isModalSubmit()) {
            modalHandler(client, interaction);
        }

        if (interaction.isButton()) {
            buttonHandler(client, interaction);
        }

        if (interaction.isChatInputCommand()) {
            commandHandler(client, interaction);
        }
    }
}