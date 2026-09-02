const initializeQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT,
        permission INTEGER NOT NULL   
    )
`;

const insertUserQuery = `
    INSERT INTO users (id, username, avatar, permission)
    VALUES (?, ?, ?, ?) RETURNING *
`;
const findUserByIdQuery = `
    SELECT * FROM users WHERE id = ?
`;

export default {
    initializeQuery, 
    insertUserQuery,
    findUserByIdQuery
}