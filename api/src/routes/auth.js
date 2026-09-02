import passport from "passport";

import { Router } from "express";
import { checkAlreadyAuthenticated, checkAuthenticated } from "../utils/authMiddlewares.js";

const router = Router();

router.get("/login", checkAlreadyAuthenticated, passport.authenticate("discord"));
router.get("/callback", checkAlreadyAuthenticated, passport.authenticate("discord"), (req, res) => {
    res.send(200);
});
router.get("/logout", checkAuthenticated, (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.send(200);
    });
});

export default router;