import type { ExtendedClient } from "@/types/client.js";
import { EmbedBuilder, GuildMember } from "discord.js";

export const registryEmbed = (
    client_avatar: string,
    member: GuildMember,
    name: string,
    email: string,
    birthdate: string,
    organization: string,
    origin: string
) =>
    new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Yeni Üye Onayı")
        .setDescription(`<@${member.id}> onaylanmayı bekliyor. Aşağıda kendisine ait tüm bilgilere ulaşabilirsin.`)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
            { name: "\u200B", value: "\u200B" },
            { name: "Ad Soyad", value: name, inline: true },
            { name: "Doğum Tarihi", value: birthdate, inline: true },
            { name: "E-posta", value: email },
            { name: "Çalıştığı Yer", value: organization, inline: true },
            { name: "Nereden Duydu", value: origin, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "Yardım sever botunuz Pengu!", iconURL: client_avatar });