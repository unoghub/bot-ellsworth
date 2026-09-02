import type ExtendedClient from "types/client.js";
import type { Event } from "types/event.js";
import eventsIndex from "../events/index.js";

export default function (client: ExtendedClient) {
    eventsIndex.forEach((event: Event) => {
        if (event.once) {
            return client.once(event.event, event.handle);
        }
        client.on(event.event, event.handle);
    });
};