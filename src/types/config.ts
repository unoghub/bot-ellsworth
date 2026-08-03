export class Config {
    data: Record<string, any>

    constructor() {}

    get(key: string): any {
        return this.data[key];
    }

    set(key: string, value: any) {
        this.data[key] = value;
    }
}