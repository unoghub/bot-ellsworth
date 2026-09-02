import passport from "passport";

import { Strategy, DiscordScope } from "discord-strategy";
import { findUserById, insertUser } from "./database/index.js";

const options = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5303/api/auth/callback",
    scope: [
        DiscordScope.Identify, DiscordScope.Guilds, DiscordScope.GuildsMembersRead
    ]
};

const verify = async (accessToken, refreshToken, profile, done, consume) => {
    try {
        const user = findUserById(profile.id);
        if (user) {
            return done(null, user);
        }

        await consume.member(process.env.GUILD_ID);
        profile = consume.profile();

        const roles = profile.member[process.env.GUILD_ID].roles;

        const permission =
            roles.includes(process.env.FULL_ACCESS_ID) ? 2 : roles.includes(process.env.READ_ACCESS_ID) ? 1 : 0;

        const newUser = insertUser({
            id: profile.id,
            username: profile.username,
            avatar: profile.avatar,
            permission: permission
        });

        return done(null, newUser);
    } catch (error) {
        console.error(error);
        return done(error, null);
    }
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    try {
        const foundUser = findUserById(id);
        return foundUser ? done(null, foundUser) : done(null, null);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new Strategy(options, verify));