import { confirmPrompt } from "@/services/confirm_prompt.js";
import { GamejamData } from "@/services/gamejam_data.js";
import {
  addJammerRoleToUser,
  removeJammerRoleFromUser,
} from "@/services/gamejam_roles.js";
import {
  create_team_thread,
  leave_team,
  update_team_thread,
} from "@/services/gamejam_teams.js";
import { buttonRegistry, modalRegistry } from "@/services/registry.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type MessageCreateOptions,
} from "discord.js";

buttonRegistry.set("join_jam", async (interaction) => {
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId("join_jam")
      .setTitle("Join Game Jam")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Legal Name")
          .setDescription("Your legal name")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("nameInput")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      ),
  );
});

modalRegistry.set("join_jam", async (interaction) => {
  const legal_name = interaction.fields.getTextInputValue("nameInput");
  const old_data = GamejamData.Participants.get(interaction.user);

  GamejamData.Participants.set(interaction.user, {
    legal_name: legal_name,
  });

  addJammerRoleToUser(interaction, interaction.user);

  if (old_data) {
    interaction.reply({
      content: "Successfully updated your game jam information.",
      flags: MessageFlags.Ephemeral,
    });
  } else {
    interaction.reply({
      content: "Successfully joined the game jam.",
      flags: MessageFlags.Ephemeral,
    });
  }
});

buttonRegistry.set("leave_jam", async (interaction) => {
  if (!GamejamData.Participants.exists(interaction.user)) {
    interaction.reply({
      content: "You are not currently a participant in the game jam.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  confirmPrompt(
    interaction,
    "Are you sure you want to leave the game jam?",
    async (confirmation) => {
      const team = await GamejamData.Participants.get_team(interaction.user);
      if (team) {
        leave_team(interaction.user, team);
      }

      GamejamData.Participants.remove(interaction.user);
      removeJammerRoleFromUser(interaction, interaction.user);

      confirmation.reply({
        content: "Successfully left the game jam.",
        flags: MessageFlags.Ephemeral,
      });
    },
  );
});

buttonRegistry.set("create_jam_team", async (interaction) => {
  if (!GamejamData.Participants.exists(interaction.user)) {
    interaction.reply({
      content: "You must be a participant in the game jam to create a team.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (GamejamData.Participants.user_in_a_team(interaction.user)) {
    interaction.reply({
      content: "You are already in a team. You cannot create a new team.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId("create_jam_team")
      .setTitle("Create Team")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Team Name")
          .setDescription("Team Name")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("team_name")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      ),
  );
});

modalRegistry.set("create_jam_team", async (interaction) => {
  const team_name = interaction.fields.getTextInputValue("team_name");
  if (GamejamData.Participants.user_in_a_team(interaction.user)) {
    interaction.reply({
      content: "You are already in a team. You cannot create a new team.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const [thread, message] = await create_team_thread({
    owner: interaction.user,
    team_name,
  });
  const team = GamejamData.Teams.create_team({
    owner: interaction.user,
    team_name,
    control_message: message,
    thread,
  });

  await update_team_thread(team);

  interaction.reply({
    content: `Successfully created team "${team_name}".`,
    flags: MessageFlags.Ephemeral,
  });
});

export const GamejamMenu = {
  content: "Welcome to the game jam and stuff",
  components: [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("join_jam")
        .setLabel("Join the Game Jam")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("create_jam_team")
        .setLabel("Create a Jam team")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("leave_jam")
        .setLabel("Leave the Jam")
        .setStyle(ButtonStyle.Danger),
    ),
  ],
} satisfies MessageCreateOptions;
