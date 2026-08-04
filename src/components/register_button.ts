import type { ExtendedClient } from "@/types/client.js";
import type { Button } from "@/types/button.js";
import { ButtonBuilder, ButtonInteraction, ButtonStyle, TextChannel, type CacheType } from "discord.js";
import Modals from "./modals.js";

export default {
    name: "register",
    builder: new ButtonBuilder()
        .setCustomId("register")
        .setLabel("Onay Formunu Doldur")
        .setStyle(ButtonStyle.Primary),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction<CacheType>) => {
        const modal = Modals.get("register")!.builder;
        interaction.showModal(modal);
    }
} satisfies Button;