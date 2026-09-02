import { Client, Events } from "discord.js";
import type { Event } from "types/event.js";

export default {
    event: Events.ClientReady,
    once: true,
    handle: async (client: Client) => {
        console.log("Pengu Bot has logged in!");
    }
} satisfies Event<Events.ClientReady>;