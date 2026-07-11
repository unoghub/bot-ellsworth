import type {
  ButtonHandler,
  CommandHandler,
  ModalHandler,
} from "@/types/handlers.js";

export const commandsRegistry = new Map<string, CommandHandler>();
export const modalRegistry = new Map<string, ModalHandler>();
export const buttonRegistry = new Map<string, ButtonHandler>();
