import type {
  BaseInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export type ModalHandler = BaseHandler<ModalSubmitInteraction>;
export type ButtonHandler = BaseHandler<ButtonInteraction>;
export type CommandHandler = BaseHandler<ChatInputCommandInteraction>;
export type BaseHandler<T extends BaseInteraction> = (
  Interaction: T,
) => Promise<void>;
