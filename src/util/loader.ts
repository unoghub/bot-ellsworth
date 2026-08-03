import { Config } from "@/types/types.js";
import fs from "fs";
import path from "path";
import { load, dump } from "js-toml";
import lodash from "lodash";

export function loadConfig(): Config {
    let config = new Config();
    try {
        const config_path = path.join(path.dirname(path.dirname(process.argv[1]!)), "config.toml");
        const config_file = fs.readFileSync(config_path, "utf-8");

        const config_data = load(config_file);

        config.data = parseObjectRecursive(config_data, "@");
    } catch (err) {
        console.error(err);
    }
    return config;
}

export function saveConfig(config: Config) {

    const config_path = path.join(path.dirname(path.dirname(process.argv[1]!)), "config.toml");

    let data: any
    Object.entries(config.data).forEach(entry => {
        const keyArray = entry[0].slice(1).split(/[:.]/);
        data = lodash.merge(data, parseKeyRecursive(keyArray, entry[1]));
    });
    let toml_data = dump(data);
    
    try {
        fs.writeFileSync(config_path, toml_data, "utf-8");
    } catch (err) {
        console.error(err);
    } 
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

function parseKeyRecursive(key: string[], value: any, depth: number = 0, parsed: any = {}): any {
    if (key.length > 1) {

        parsed[key[0] as string] = {}

        parseKeyRecursive(key.slice(1), value, depth + 1, parsed[key[0] as string])
    } else {
        parsed[key[0] as string] = value
    }

    return parsed;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target } as any;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject((source as any)[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: (source as any)[key] });
        } else {
          output[key] = deepMerge((target as any)[key], (source as any)[key]);
        }
      } else {
        Object.assign(output, { [key]: (source as any)[key] });
      }
    });
  }

  return output;
}

// @channels.special.quote_channel_id 
/*
    {
        channels: {
            special: {
                quote_channel_id: 1
            }
        }
    }
*/