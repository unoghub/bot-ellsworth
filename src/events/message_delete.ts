
import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, TextChannel, type Message, type PartialMessage, type OmitPartialGroupDMChannel, type Channel } from "discord.js";

export const event: Event<Events.MessageDelete> = {
    event: Events.MessageDelete,
    once: false,
    async handle(message: Message | OmitPartialGroupDMChannel<PartialMessage>) {
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
}