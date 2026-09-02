import sqlite from "better-sqlite3";
import queries from "./queries.js";

const options = {};
const database = new sqlite("database.db", options);

database.exec(queries.initializeQuery);

const insertUserStatement = database.prepare(queries.insertUserQuery);
const findUserByIdStatement = database.prepare(queries.findUserByIdQuery);

export const insertUser = database.transaction((user) => {
    return insertUserStatement.get(
        user.id,
        user.username,
        user.avatar,
        user.permission
    );
});

export const findUserById = database.transaction((id) => {
    return findUserByIdStatement.get(id);
});