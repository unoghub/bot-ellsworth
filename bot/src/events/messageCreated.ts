import { Events, Message, TextChannel } from "discord.js";
import type ExtendedClient from "types/client.js";
import type { Event } from "types/event.js";

export default {
    event: Events.MessageCreate,
    once: true,
    handle: async (message: Message) => {
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
} satisfies Event<Events.MessageCreate>;