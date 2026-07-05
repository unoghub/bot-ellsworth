import type { ModalHandler } from "@/types/handlers.js";

const modalRegistry = new Map<string, ModalHandler>();

export default modalRegistry;
