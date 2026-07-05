import type { ButtonHandler } from "@/types/handlers.js";
import type { ButtonBuilder } from "discord.js";

const buttonRegistry = new Map<string, ButtonHandler>();

export default buttonRegistry;
