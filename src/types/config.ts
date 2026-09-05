import zod from "zod";

const configSchema = zod.object({
    VERIFIED_ROLE: zod.string(),
    VERIFIER_ROLE: zod.string(),
    NEW_COMER_ROLE: zod.string(),

    ANNOUNCEMENT_ORIGIN: zod.string(),
    ANNOUNCEMENT_MIRROR: zod.string(),

    VERIFICATION_CHANNEL: zod.string()
});

export default configSchema.parse(process.env);