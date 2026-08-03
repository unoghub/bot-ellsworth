export default [
    (await import("./client_ready.js")).event,
    (await import("./interaction_create.js")).event,
];
