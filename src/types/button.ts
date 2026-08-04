import {
    ButtonBuilder,
    ButtonInteraction,
    type CacheType,
} from "discord.js";
import type { ExtendedClient } from "./client.js";

export type ButtonHandler = (client: ExtendedClient, interaction: ButtonInteraction<CacheType>)
    => Promise<void>;

export class Button {
    name: string;
    builder: ButtonBuilder;
    handle: ButtonHandler;

    constructor(init?: Partial<Button>) {
        Object.assign(this, init);
    }
}
