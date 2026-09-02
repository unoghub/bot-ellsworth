import "dotenv/config";
import zod from "zod";

const envSchema = zod.object({
    TOKEN: zod.string(),
    CLIENT_ID: zod.string(),
    GUILD_ID: zod.string(),
});

export default envSchema.parse(process.env);