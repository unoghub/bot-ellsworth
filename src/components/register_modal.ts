import type { ExtendedClient } from "@/types/client.js";
import type { Modal } from "@/types/modal.js";
import { LabelBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle, type CacheType } from "discord.js";

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
                        .setPlaceholder("isim soyisim")
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
        client.channels.fetch(
            client.config.get("@channels.verification:verification_channel")
        ).then(channel => {
            (channel as TextChannel).send("New user registered!");
            interaction.deferUpdate();
        })
    }
} satisfies Modal;