export default [
    (await import("./client_ready.js")).event,
    (await import("./interaction_create.js")).event,
    (await import("./guild_member_join.js")).event,
];
