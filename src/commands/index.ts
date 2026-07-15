export default [
  (await import("./ping.js")).default,
  (await import("./refresh.js")).default,
  (await import("./set-gamejam.js")).default,
  (await import("./add-blacklist.js")).default,
];
