import {
    ButtonBuilder,
    ButtonInteraction,
    type CacheType,
} from "discord.js";
import type { ExtendedClient } from "./client.js";

export type ButtonHandler = (client: ExtendedClient, interaction: ButtonInteraction<CacheType>)
    => Promise<void>;

export interface Button {
    name: string;
    builder: ButtonBuilder;
    handle: ButtonHandler;
}
