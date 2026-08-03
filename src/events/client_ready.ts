
import { type Event } from "@/types/types.js";
import { Events, Client } from "discord.js";

export const event: Event<Events.ClientReady> = {
    event: Events.ClientReady,
    once: true,
    async handle(client: Client) {
        console.log(`Logged in as ${client.user?.tag}!`);
    }
}