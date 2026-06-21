import { type Command } from '@/command.js'
import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder().setName('lan').setDescription('Lan mı?!'),
    async execute(interaction) {
        interaction.reply("Lan mı?!");
    }
} satisfies Command;