import { Events, Message, TextChannel } from "discord.js";
import type ExtendedClient from "types/client.js";
import type { Event } from "types/event.js";

export default {
    event: Events.MessageDelete,
    once: true,
    handle: async (message: Message) => {
        const client = message.client as ExtendedClient;

        const announcementOriginChannelId =
            client.config.get("@channels.announcement:announcement_origin_channel");
        const announcementMirrorChannelId =
            client.config.get("@channels.announcement:announcement_mirror_channel");

        const deletingMessageChannelId = message.channelId;

        if (announcementOriginChannelId != deletingMessageChannelId) {
            return;
        }
        const mirrorChannel = await client.channels.fetch(announcementMirrorChannelId) as TextChannel;
        if (mirrorChannel == null) {
            return;
        }
        const mirrorMessageId = client.announcements.get(message.id);
        if (mirrorMessageId == null) {
            return;
        }

        await mirrorChannel.messages.fetch(mirrorMessageId).then(message => {
            message.delete();
        });
    }
} satisfies Event<Events.MessageDelete>;