import { type Command } from "@/types/command.js";
import { MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription("Manage bot's verification process")
        .addSubcommand(
            subcmd => subcmd
                .setName("create_form_button")
                .setDescription("Create a form for verification")
        ),
    async execute(interaction, client) {
        const subcmd = interaction.options.getSubcommand();

        const channel_id = interaction.channel?.id;

        if (subcmd === "create_form_button") {
            client.channels.fetch(channel_id!).then(channel => {
                (channel as TextChannel).send({
                    content: `## :white_check_mark: Lütfen sunucuya erişmek için aşağıdaki formu doldurun. ##`,
                });
            })

            await interaction.reply({
                content: "Done!",
                flags: MessageFlags.Ephemeral
            });
        }
    },
} satisfies Command;
