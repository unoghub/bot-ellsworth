import { Modals } from "components/index.js";
import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import { Button } from "types/component.js";
import type ExtendedClient from "types/client.js";

export default new Button({
    name: "register",
    builder: new ButtonBuilder()
        .setCustomId("register")
        .setLabel("Onay Formunu Doldur")
        .setStyle(ButtonStyle.Primary),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction) => {
        const modal = Modals.get("register")!.builder;
        interaction.showModal(modal);
    }
});