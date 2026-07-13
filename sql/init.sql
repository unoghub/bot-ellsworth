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
    owner_id TEXT NOT NULL UNIQUE,
    team_name TEXT NOT NULL,
    control_channel TEXT NOT NULL UNIQUE,
    buttons_message TEXT NOT NULL UNIQUE,

    voice_channel TEXT NOT NULL UNIQUE,

    FOREIGN KEY (owner_id)
    REFERENCES participants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
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

CREATE TABLE IF NOT EXISTS join_requests (
    request_message_id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    FOREIGN KEY (team_id)
    REFERENCES jam_teams(id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id)
    REFERENCES participants(id)
    ON DELETE CASCADE,

    UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS submissions (
    team_id TEXT PRIMARY KEY,
    game_name TEXT NOT NULL,
    description TEXT,
    game_url TEXT NOT NULL,

    FOREIGN KEY (team_id)
    REFERENCES jam_teams(id)
    ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS join_request_not_member
BEFORE INSERT ON join_requests
FOR EACH ROW
WHEN EXISTS (
SELECT 1
FROM team_members
WHERE team_id = NEW.team_id
AND user_id = NEW.user_id
)
BEGIN
SELECT RAISE(ABORT, 'User is already a member of this team');
END;

CREATE TRIGGER IF NOT EXISTS member_not_join_request
BEFORE INSERT ON team_members
FOR EACH ROW
WHEN EXISTS (
SELECT 1
FROM join_requests
WHERE team_id = NEW.team_id
AND user_id = NEW.user_id
)
BEGIN
SELECT RAISE(ABORT, 'Join request already exists');
END;
