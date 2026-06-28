import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { client } from "./client.js";
import { teams_channel } from "./gamejam_data.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type APIButtonComponentWithCustomId,
} from "discord.js";
import buttonRegistry from "./buttonRegistry.js";
import type { ButtonHandler } from "@/types/handlers.js";

type GamejamData = {
  messages: string[];
};

const defaultData: GamejamData = { messages: [] };
export const database: Low<GamejamData> = await JSONFilePreset<GamejamData>(
  "gamejam_db.json",
  defaultData,
);

export async function setup() {
  /*
  if (!channel) {
    console.log("Channel not found!");
    return;
  }

  if (!channel.isTextBased()) {
    console.log("Channel is not text-based.");
    return;
  }

  if (!channel.isSendable()) {
    console.log("Channel is not sendable.");
    return;
  }

  const messages = await channel.messages.fetch();
  const botMessages = messages.filter(
    (message) => message.author.id === client.user?.id,
  );

  const first = botMessages.first();

  const evilButton = new ButtonBuilder()
    .setCustomId("evil-button")
    .setLabel("Evil Button")
    .setEmoji("😈")
    .setStyle(ButtonStyle.Danger);

  buttonRegistry.set(
    (evilButton.data as APIButtonComponentWithCustomId).custom_id,
    async (interaction) => {
      await interaction.reply({
        content: "YOU'VE BEEN CURSED",
        flags: MessageFlags.Ephemeral,
      });
    },
  );

  const row = new ActionRowBuilder<ButtonBuilder>();

  row.addComponents(evilButton);

  const messageObject = {
    content: "Click my evil buttons",
    components: [row],
  };

  if (first) {
    first.edit(messageObject);
  } else {
    channel.send(messageObject);
  }
  */
}
