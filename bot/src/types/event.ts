import type { ClientEvents } from "discord.js";

export type EventHandler =
    (...args: any[]) => Promise<void>;

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
    event: K,
    once: boolean,
    handle: EventHandler
};