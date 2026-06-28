import type {
  BaseInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";

export type ButtonHandler = BaseHandler<ButtonInteraction>;
export type CommandHandler = BaseHandler<ChatInputCommandInteraction>;
export type BaseHandler<T extends BaseInteraction> = (
  Interaction: T,
) => Promise<void>;
