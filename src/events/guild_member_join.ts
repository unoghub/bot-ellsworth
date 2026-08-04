
import { ExtendedClient, type Event } from "@/types/types.js";
import { Events, GuildMember } from "discord.js";

export const event: Event<Events.GuildMemberAdd> = {
    event: Events.GuildMemberAdd,
    once: true,
    async handle(member: GuildMember) {

        const client = member.client as ExtendedClient;
        const waiting_role_id = client.config.get("@roles.verification:waiting_role");
        const waiting_role = await member.guild.roles.fetch(waiting_role_id);

        await member.roles.add(waiting_role!);
    }
}