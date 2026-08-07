export default [
    (await import("./client_ready.js")).event,
    (await import("./interaction_create.js")).event,
    (await import("./guild_member_join.js")).event,
    (await import("./message_created.js")).event,
    (await import("./message_updated.js")).event,
    (await import("./message_delete.js")).event,
];
