import ExtendedClient from "types/client.js";
import type { Event } from "types/event.js";
import { Events, type Interaction } from "discord.js";

import handleCommand from "utils/handleCommand.js";
import handleModal from "utils/handleModal.js";
import handleButton from "utils/handleButton.js";

export default {
    event: Events.InteractionCreate,
    once: false,
    handle: async (interaction: Interaction) => {
        const client = interaction.client as ExtendedClient;

        if (interaction.isModalSubmit()) {
            handleModal(client, interaction);
        }

        if (interaction.isButton()) {
            handleButton(client, interaction);
        }

        if (interaction.isChatInputCommand()) {
            handleCommand(client, interaction);
        }
    }
} satisfies Event<Events.InteractionCreate>;