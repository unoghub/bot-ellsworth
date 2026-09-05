import type { ExtendedClient } from "@/types/client.js";
import type { Modal } from "@/types/modal.js";
import { ActionRowBuilder, ButtonBuilder, GuildMember, LabelBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction, PermissionFlagsBits, PermissionsBitField, TextChannel, TextInputBuilder, TextInputStyle, type CacheType, type Channel } from "discord.js";
import Buttons from "./buttons.js";
import { registryEmbed } from "./embeds.js";
import config from "@/types/config.js";

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

        const action_row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            Buttons.get("registry-approve")!.builder, Buttons.get("registry-reject")!.builder
        );

        const member = interaction.member as GuildMember;

        let error: string = "";

        const name = interaction.fields.getTextInputValue("name");
        const email = interaction.fields.getTextInputValue("email");
        const birthdate = interaction.fields.getTextInputValue("birthdate");
        const organization = interaction.fields.getTextInputValue("organization");
        const origin = interaction.fields.getTextInputValue("origin");

        if (name.split(" ").length < 2) {
            error += "Hatalı ad soyad!";
        }
        if (email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) == null) {
            error += "Hatalı e-posta!";
        }

        if (error != "") {
            await member.send({
                content: `Merhaba, yapmış olduğunuz başvuruda sorun vardır. ${error}`,
            });
            await interaction.deferUpdate();
            return;
        }

        const channel = await client.channels.fetch(
            config.VERIFICATION_CHANNEL
        ) as TextChannel;

        channel.send({
            embeds: [registryEmbed(
                client.user?.avatarURL()!,
                member,
                name,
                email,
                birthdate,
                organization,
                origin,
            )],
            components: [action_row]
        });

        try {
            await member.setNickname(interaction.fields.getTextInputValue("name"));
        } catch (error) {
            console.error(error);
        }

        interaction.deferUpdate();
    }
} satisfies Modal;