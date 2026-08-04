import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default new ModalBuilder()
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
            .setLabel("İş")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("organization")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Şu anda çalıştığınız yer")
            )
    )
    .addLabelComponents(
        new LabelBuilder()
            .setLabel("Tecrübe")
            .setTextInputComponent(
                new TextInputBuilder()
                    .setCustomId("experience")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("Daha önceki tecrübeleriniz")
            )
    );
