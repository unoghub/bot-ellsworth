CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jammer_blacklist (
    id TEXT PRIMARY KEY,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS jam_teams (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    team_name TEXT NOT NULL,
    control_channel TEXT NOT NULL,
    buttons_message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL UNIQUE,

    PRIMARY KEY (team_id, user_id),

    FOREIGN KEY (team_id)
    REFERENCES jam_teams(id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id)
    REFERENCES participants(id)
    ON DELETE CASCADE
);
