import { EmbedBuilder } from "discord.js";

export default function (
    client_avatar: string,
    id: string,
    name: string,
    avatar: string,
    email: string,
    birthdate: string,
    organization: string,
    origin: string
) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Yeni Üye Onayı")
        .setDescription(`<@${id}> onaylanmayı bekliyor. Aşağıda kendisine ait tüm bilgilere ulaşabilirsin.`)
        .setThumbnail(avatar)
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
};
