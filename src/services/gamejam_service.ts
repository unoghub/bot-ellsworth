import { Events, TextChannel } from "discord.js";
import { client } from "./client.js";
import { GamejamData } from "./gamejam_data.js";

export async function setup_teams_view() {}

client.on(Events.ClientReady, setup_jam_view);

export async function setup_jam_view() {
  const channel = (await GamejamData.Menu.Channel.get()) as TextChannel;

  if (!channel) return;

  var message = await GamejamData.Menu.Message.get();

  if (!message) {
    message = await channel.send({
      content: "pluh",
    });
    GamejamData.Menu.Message.set(message);
  }
}
