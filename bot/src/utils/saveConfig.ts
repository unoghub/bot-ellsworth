import type Config from "types/config.js";
import fs from "fs";
import path from "path";
import { dump } from "js-toml";
import lodash from "lodash";

export default function (config: Config) {

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