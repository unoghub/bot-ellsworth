
import config from "@/types/config.js";
import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, TextChannel, type Message, type PartialMessage, type OmitPartialGroupDMChannel, type Channel } from "discord.js";

export const event: Event<Events.MessageUpdate> = {
    event: Events.MessageUpdate,
    once: false,
    async handle(
        oldMessage: Message | OmitPartialGroupDMChannel<PartialMessage>, newMessage: Message
    ) {
        const client = newMessage.client as ExtendedClient;

        const announcementOriginChannelId =
            config.ANNOUNCEMENT_ORIGIN;
        const announcementMirrorChannelId =
            config.ANNOUNCEMENT_MIRROR;

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
}