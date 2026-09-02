import {
    ButtonBuilder,
    ButtonInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
} from "discord.js";
import type ExtendedClient from "./client.js";

export type ButtonHandler = (client: ExtendedClient, interaction: ButtonInteraction)
    => Promise<void>;

export class Button {
    name: string;
    builder: ButtonBuilder;
    handle: ButtonHandler;

    constructor(init?: Partial<Button>) {
        Object.assign(this, init);
    }
};

export type ModalHandler = (client: ExtendedClient, interaction: ModalSubmitInteraction)
    => Promise<void>;

export interface Modal {
    name: string;
    builder: ModalBuilder;
    handle: ModalHandler;
};
