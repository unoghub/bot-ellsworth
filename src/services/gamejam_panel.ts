import {
  ChannelType,
  Events,
  Message,
  TextChannel,
  type OverwriteResolvable,
} from "discord.js";
import { GamejamData } from "./gamejam_data.js";
import { generateGamejamMenu } from "@/content/gamejam_content.js";
import { client } from "./client.js";

client.on(Events.ChannelDelete, async (channel) => {
  if (channel.id !== (await GamejamData.Menu.Channel.rawget())) return;
  console.log("oh my god the channel got deleted");
  GamejamData.Menu.Channel.clear();
  GamejamData.Menu.Message.clear();
});

export async function create_panel_channel(options?: {
  new?: boolean;
}): Promise<TextChannel> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const perms = [
    {
      id: guild.roles.everyone.id,
      deny: ["SendMessages"],
    },
  ] as OverwriteResolvable[];
  if (!options?.new) {
    const existingChannel =
      (await GamejamData.Menu.Channel.get()) as TextChannel;
    if (existingChannel) {
      console.log("Menu channel already exists");
      existingChannel.permissionOverwrites.set(perms);
      return existingChannel as TextChannel;
    }
  }

  const channel = await guild.channels.create({
    name: "gamejam-panel",
    type: ChannelType.GuildText,
    topic: "Gamejam menu",
    permissionOverwrites: perms,
  });
  GamejamData.Menu.Channel.set(channel);

  return channel;
}

export async function update_panel_message(): Promise<Message> {
  const channel = (await GamejamData.Menu.Channel.get()) as TextChannel;

  if (!channel) throw new Error("no channel");

  var fetched_message = await GamejamData.Menu.Message.get({ force: true });

  if (!fetched_message) {
    fetched_message = await channel.send(generateGamejamMenu());
    GamejamData.Menu.Message.set(fetched_message);
  } else await fetched_message.edit(generateGamejamMenu());

  return fetched_message;
}
