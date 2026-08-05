import type { ExtendedClient } from "@/types/client.js";
import { Button } from "@/types/button.js";
import { ButtonBuilder, ButtonInteraction, ButtonStyle, TextChannel, type CacheType } from "discord.js";
import Modals from "./modals.js";

export const registryApproveButton = new Button({
    name: "registry-approve",
    builder: new ButtonBuilder()
        .setCustomId("registry-approve")
        .setLabel("Onayla")
        .setStyle(ButtonStyle.Success),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction<CacheType>) => {
        
        const verifiedRoleId = client.config.get("@roles.verification:verified");
        const verifiedRole = await interaction.guild?.roles.fetch(verifiedRoleId);

        const regex = /[0-9]+/i
        const memberId = regex.exec(interaction.message.embeds[0]?.description!)?.[0]!;
        
        const member = interaction.guild?.members.cache.get(memberId.toString());
        member?.roles.add(verifiedRole!);

        interaction.deferUpdate();
    }
});

export const registryRejectButton = new Button({
    name: "registry-reject",
    builder: new ButtonBuilder()
        .setCustomId("registry-reject")
        .setLabel("Reddet")
        .setStyle(ButtonStyle.Danger),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction<CacheType>) => {
        const regex = /[0-9]+/i
        const memberId = regex.exec(interaction.message.embeds[0]?.description!)?.[0]!;
        
        const member = interaction.guild?.members.cache.get(memberId.toString());

        member?.send("Şu anda sizi sunucumuza alamıyoruz!");
        interaction.deferUpdate();
    }
});

export const registerButton = new Button({
    name: "register",
    builder: new ButtonBuilder()
        .setCustomId("register")
        .setLabel("Onay Formunu Doldur")
        .setStyle(ButtonStyle.Primary),
    handle: async (client: ExtendedClient, interaction: ButtonInteraction<CacheType>) => {
        const modal = Modals.get("register")!.builder;
        interaction.showModal(modal);
    }
});