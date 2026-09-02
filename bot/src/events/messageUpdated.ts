import { Events, Message, TextChannel } from "discord.js";
import type ExtendedClient from "types/client.js";
import type { Event } from "types/event.js";

export default {
    event: Events.MessageUpdate,
    once: true,
    handle: async (oldMessage: Message, newMessage: Message) => {
        const client = newMessage.client as ExtendedClient;

        const announcementOriginChannelId =
            client.config.get("@channels.announcement:announcement_origin_channel");
        const announcementMirrorChannelId =
            client.config.get("@channels.announcement:announcement_mirror_channel");

        const updatingMessageChannelId = newMessage.channelId;

        if (announcementOriginChannelId != updatingMessageChannelId) {
            return;
        }
        const mirrorChannel = await client.channels.fetch(announcementMirrorChannelId) as TextChannel;
        if (mirrorChannel == null) {
            return;
        }
        const mirrorMessageId = client.announcements.get(newMessage.id);
        if (mirrorMessageId == null) {
            return;
        }

        await mirrorChannel.messages.fetch(mirrorMessageId).then(message => {
            message.edit({
                content: newMessage.content
            });
        });
    }
} satisfies Event<Events.MessageUpdate>;