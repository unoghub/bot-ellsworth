import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import type ExtendedClient from "types/client.js";
import { Button } from "types/component.js";

export default new Button({
    name: "registry-reject",
    builder: new ButtonBuilder()
        .setCustomId("registry-reject")
        .setLabel("Reddet")
        .setStyle(ButtonStyle.Danger),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction) => {
        const regex = /[0-9]+/i
        const memberId = regex.exec(interaction.message.embeds[0]?.description!)?.[0]!;

        const member = interaction.guild?.members.cache.get(memberId.toString());

        member?.send("Şu anda sizi sunucumuza alamıyoruz!");
        interaction.deferUpdate();
    }
});