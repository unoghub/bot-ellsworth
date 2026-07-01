import { GamejamData } from "./gamejam_data.js";

export async function setup_teams_view() {}

export async function setup_jam_view() {
  const channel = GamejamData.Menu.Channel.get();

  if (!channel) return;
}
