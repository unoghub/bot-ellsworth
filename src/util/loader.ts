import { Config } from "@types";
import fs from "fs";
import path from "path";
import toml from "toml";

export function loadConfig(): Config {
    try {
        const config_path = path.join(path.dirname(path.dirname(process.argv[1]!)), "bot.config")
        const config_file = fs.readFileSync(config_path, "utf-8");

        const config_data = toml.parse(config_file, { bigint: true });

        let config = new Config();
        config.cool_channel = config_data.channels.cool_channel_id
        return config;
    } catch (err) {
        console.error(err);
    }
    throw "Couldn't find the bot.config file";
}