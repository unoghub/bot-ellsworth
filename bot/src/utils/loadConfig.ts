import Config from "types/config.js";
import fs from "fs";
import path from "path";
import { load } from "js-toml";

export default function (): Config {
    let config = new Config();
    try {
        const config_path = "./config.toml";
        const config_file = fs.readFileSync(config_path, "utf-8");

        const config_data = load(config_file);

        config.data = parseObjectRecursive(config_data, "@");
    } catch (err) {
        console.error(err);
    }
    return config;
}

function parseObjectRecursive(data: any, key: string, depth: number = 0, parsed: Record<string, any> = {}): any {
    let augmented_key = key
    for (const entry in data) {
        if (typeof data[entry] === "object") {
            augmented_key = key + (depth == 0 ? "" : ".") + entry
            parseObjectRecursive(data[entry], augmented_key, depth + 1, parsed)
        } else {
            augmented_key = key + ":" + entry
            parsed[augmented_key] = data[entry];
        }
    }
    return parsed;
}