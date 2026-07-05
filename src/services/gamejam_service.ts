import { Events, TextChannel } from "discord.js";
import { client } from "./client.js";
import { GamejamData } from "./gamejam_data.js";
import { GamejamMenu } from "@/content/gamejam_content.js";

export async function setup_teams_view() {}

client.on(Events.ClientReady, setup_jam_view);

export async function setup_jam_view() {
  const channel = (await GamejamData.Menu.Channel.get()) as TextChannel;

  if (!channel) return;

  var fetched_message = await GamejamData.Menu.Message.get();

  if (!fetched_message) {
    const updated_message = await channel.send(GamejamMenu);
    GamejamData.Menu.Message.set(updated_message);
  } else {
    await fetched_message.edit(GamejamMenu);
  }
}
