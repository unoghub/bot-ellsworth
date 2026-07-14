import { Client, GatewayIntentBits } from "discord.js";
import { boolean } from "zod";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

export var service_ready = {
  status: true,
  lock() {
    if (!this.status) throw new Error("Service is already locked");
    this.status = false;
  },
  unlock() {
    this.status = true;
  },
};
