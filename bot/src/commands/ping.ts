import type { Command } from "types/command.js";
import { Ping } from "./meta/index.js";

export default {
    data: Ping(),
    execute: async (client, interaction) => {
        await interaction.reply("Pong!");
    }
} satisfies Command;