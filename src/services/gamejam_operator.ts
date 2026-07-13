import {
  ChannelType,
  type CategoryChannel,
  type OverwriteResolvable,
} from "discord.js";
import { GamejamData } from "./gamejam_data.js";

export async function create_archive_category(): Promise<CategoryChannel> {
  const guild = await GamejamData.Guild.get();
  if (!guild) throw new Error("no guild");

  const jammerRole = await GamejamData.JammerRole.get();
  if (!jammerRole) throw new Error("no role");

  const operatorRole = await GamejamData.OperatorRole.get();
  if (!operatorRole) throw new Error("no role");

  var perms = [
    {
      id: operatorRole.id,
      allow: ["ViewChannel"],
    },
    {
      id: guild.roles.everyone.id,
      deny: ["ViewChannel"],
    },
  ] as OverwriteResolvable[];

  const existingCategory = await GamejamData.ArchiveCategory.get();
  if (existingCategory) {
    console.log("Communications category already exists");
    existingCategory.permissionOverwrites.set(perms);
    return existingCategory as CategoryChannel;
  }

  const category = await guild.channels.create({
    name: "gamejam-archive",
    type: ChannelType.GuildCategory,
    permissionOverwrites: perms,
  });
  GamejamData.ArchiveCategory.set(category);

  return category;
}
