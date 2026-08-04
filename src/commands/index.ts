export default [
    (await import("./ping.js")).default,
    (await import("./config.js")).default,
    (await import("./test_verification.js")).default
];
