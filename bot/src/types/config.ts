import loadConfig from "utils/loadConfig.js";
import saveConfig from "utils/saveConfig.js";

export default class Config {

    static instance: Config

    data: Record<string, any>

    constructor() {}

    static load(): Config {
        if (!this.instance) {
            Config.instance = loadConfig();
        }
        return Config.instance;
    }

    static save(): void {
        saveConfig(Config.instance);
    }

    get(key: string): any {
        return this.data[key];
    }

    set(key: string, value: any) {
        this.data[key] = value;
    }
}
