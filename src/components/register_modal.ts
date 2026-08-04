import type { ExtendedClient } from "@/types/client.js";
import type { Modal } from "@/types/modal.js";
import { ActionRowBuilder, ButtonBuilder, GuildMember, LabelBuilder, ModalBuilder, ModalSubmitInteraction, PermissionFlagsBits, TextChannel, TextInputBuilder, TextInputStyle, type CacheType, type Channel } from "discord.js";
import Buttons from "./buttons.js";
import { registryEmbed } from "./embeds.js";

export default {
    name: "register",
    builder: new ModalBuilder()
        .setCustomId("register")
        .setTitle("Register")
        .addLabelComponents(
            new LabelBuilder()
                .setLabel("Ad Soyad")
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId("name")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Ad Soyad")
                )
        )
        .addLabelComponents(
            new LabelBuilder()
                .setLabel("E-posta")
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId("email")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("example@example.com")
                )
        )
        .addLabelComponents(
            new LabelBuilder()
                .setLabel("Doğum Tarihi")
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId("birthdate")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("23.04.1923")
                )
        )
        .addLabelComponents(
            new LabelBuilder()
                .setLabel("Bulunduğunuz Kurum/Ekip")
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId("organization")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Şu anda çalıştığınız yer")
                )
        )
        .addLabelComponents(
            new LabelBuilder()
                .setLabel("ÜNOG'u nasıl keşfettiniz?")
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId("origin")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Sosyal medya")
                )
        ),
    handle: async (client: ExtendedClient, interaction: ModalSubmitInteraction<CacheType>) => {

        const action_row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                Buttons.get("registry-approve")!.builder, Buttons.get("registry-reject")!.builder
            );

        const member = interaction.member as GuildMember;

        const channel = await client.channels.fetch(
            client.config.get("@channels.verification:verification_channel")
        ) as TextChannel;

        channel.send({
            embeds: [registryEmbed(
                client.user?.avatarURL()!,
                member,
                interaction.fields.getTextInputValue("name"),
                interaction.fields.getTextInputValue("email"),
                interaction.fields.getTextInputValue("birthdate"),
                interaction.fields.getTextInputValue("organization"),
                interaction.fields.getTextInputValue("origin"),
            )],
            components: [action_row]
        });
        interaction.deferUpdate();
    }
} satisfies Modal;