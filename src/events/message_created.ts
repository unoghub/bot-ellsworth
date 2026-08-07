
import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, TextChannel, type Message } from "discord.js";

export const event: Event<Events.MessageCreate> = {
    event: Events.MessageCreate,
    once: false,
    async handle(message: Message) {

        const client = message.client as ExtendedClient;

        const announcementOriginChannelId =
            client.config.get("@channels.announcement:announcement_origin_channel");
        const announcementMirrorChannelId =
            client.config.get("@channels.announcement:announcement_mirror_channel");

        const incomingMessageChannelId = message.channelId;

        if (announcementOriginChannelId != incomingMessageChannelId) {
            return;
        }

        const channel = await client.channels.fetch(announcementMirrorChannelId) as TextChannel;
        const mirrorMessage = await channel.send({
            content: message.content
        });

        client.announcements.set(message.id, mirrorMessage.id);
    }
}