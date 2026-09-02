import { Button } from "types/component.js";
import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import type ExtendedClient from "types/client.js";

export default new Button({
    name: "registry-approve",
    builder: new ButtonBuilder()
        .setCustomId("registry-approve")
        .setLabel("Onayla")
        .setStyle(ButtonStyle.Success),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction) => {
        
        const verifiedRoleId = client.config.get("@roles.verification:verified");
        const verifiedRole = await interaction.guild?.roles.fetch(verifiedRoleId);

        const regex = /[0-9]+/i
        const memberId = regex.exec(interaction.message.embeds[0]?.description!)?.[0]!;
        
        const member = interaction.guild?.members.cache.get(memberId.toString());
        member?.roles.add(verifiedRole!);

        interaction.deferUpdate();
    }
});