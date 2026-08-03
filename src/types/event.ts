import type { ClientEvents } from "discord.js";

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
    event: K;
    once: boolean,
    handle: (...args: ClientEvents[K]) => Promise<void> | void;
}