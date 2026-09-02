import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";

import routes from "./routes/index.js";

import "./passport.js";

export const createApp = () => {
    const app = express();

    app.use(cors({
        origin: "http://localhost:5173"
    }));

    app.use(express.json());
    app.use(express.urlencoded());

    app.use(session({
        secret: "SECRET",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api", routes);

    return app;
};

export const listenServer = (app) => {
    app.listen(5303, () => {
        console.log("Pengu Backend is now running!");
    });
}