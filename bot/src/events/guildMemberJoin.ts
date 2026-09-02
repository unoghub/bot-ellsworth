import { Events, GuildMember } from "discord.js";
import type ExtendedClient from "types/client.js";
import type { Event } from "types/event.js";

export default {
    event: Events.GuildMemberAdd,
    once: true,
    handle: async (member: GuildMember) => {
        const client = member.client as ExtendedClient;
        const waiting_role_id = client.config.get("@roles.verification:waiting_role");
        const waiting_role = await member.guild.roles.fetch(waiting_role_id);

        await member.roles.add(waiting_role!);
    }
} satisfies Event<Events.GuildMemberAdd>;