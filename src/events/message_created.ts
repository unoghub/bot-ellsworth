import config from "@/types/config.js";

import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, TextChannel, type Message } from "discord.js";

export const event: Event<Events.MessageCreate> = {
    event: Events.MessageCreate,
    once: false,
    async handle(message: Message) {

        const client = message.client as ExtendedClient;

        const announcementOriginChannelId =
            config.ANNOUNCEMENT_ORIGIN;
        const announcementMirrorChannelId =
            config.ANNOUNCEMENT_MIRROR;

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