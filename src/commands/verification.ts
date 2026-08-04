import Buttons from "@/components/buttons.js";
import { type Command } from "@/types/command.js";
import { ActionRowBuilder, ButtonBuilder, MessageFlags, SlashCommandBuilder, TextChannel } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription("Manage bot's verification process")
        .addSubcommand(
            subcmd => subcmd
                .setName("create_form_button")
                .setDescription("Create a form for verification")
        ),
    async execute(client, interaction) {
        const subcmd = interaction.options.getSubcommand();

        const channel_id = interaction.channel?.id;

        const button = Buttons.get("register")!.builder;
        const action_row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        if (subcmd === "create_form_button") {
            client.channels.fetch(channel_id!).then(channel => {
                (channel as TextChannel).send({
                    content: `## :white_check_mark: Lütfen sunucuya erişmek için aşağıdaki formu doldurun. ##`,
                    components: [action_row]
                });
            })

            await interaction.reply({
                content: "Done!",
                flags: MessageFlags.Ephemeral
            });
        }
    },
} satisfies Command;
