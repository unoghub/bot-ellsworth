export default [
  (await import("./ping.js")).default,
  (await import("./set-jam-teams-channel.js")).default,
  (await import("./set-jam-cmds-channel.js")).default,
];
