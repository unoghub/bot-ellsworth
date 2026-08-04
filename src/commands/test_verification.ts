import RegisterModal from "@/modals/register_modal.js";
import { type Command } from "@/types/command.js";
import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("test_verification").setDescription("Check ping."),
    async execute(interaction) {

        await interaction.showModal(RegisterModal);
    },
} satisfies Command;
