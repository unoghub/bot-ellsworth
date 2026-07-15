export default [
  (await import("./ping.js")).default,
  (await import("./refresh.js")).default,
  (await import("./set-gamejam.js")).default,
  (await import("./add-blacklist.js")).default,
  (await import("./remove-blacklist.js")).default,
  (await import("./remove-participant.js")).default,
  (await import("./remove_from_team.js")).default,
];
