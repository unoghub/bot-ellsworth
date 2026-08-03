import { Config } from "@/types/types.js";
import fs from "fs";
import path from "path";
import toml from "toml";

export function loadConfig(): Config {
    let config = new Config();
    try {
        const config_path = path.join(path.dirname(path.dirname(process.argv[1]!)), "config.toml")
        const config_file = fs.readFileSync(config_path, "utf-8");

        const config_data = toml.parse(config_file, { bigint: true });

        config.data = parseObjectRecursive(config_data, "@");
    } catch (err) {
        console.error(err);
    }
    return config;
}

function parseObjectRecursive(data: any, key: string, depth: number = 0, parsed: Record<string, any> = {}) {
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