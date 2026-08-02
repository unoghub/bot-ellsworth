import { Client, type ClientOptions } from "discord.js";
import type { Config } from "./config.js";

export class ExtendedClass extends Client {
    public config: Config

    constructor(options: ClientOptions, config: Config) {
        super(options);
        this.config = config;
    }
}