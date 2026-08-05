import {
    ModalBuilder,
    ModalSubmitInteraction,
    type CacheType,
} from "discord.js";
import type { ExtendedClient } from "./client.js";

export type ModalHandler = (client: ExtendedClient, interaction: ModalSubmitInteraction<CacheType>)
    => Promise<void>;

export interface Modal {
    name: string;
    builder: ModalBuilder;
    handle: ModalHandler;
}
