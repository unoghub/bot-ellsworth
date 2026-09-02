import { Router } from "express";
import { checkAlreadyAuthenticated, checkAuthenticated } from "../utils/authMiddlewares.js";
import { startBotCommand, stopBotCommand } from "../manager/index.js";

const router = Router();

router.get("/", checkAuthenticated, (req, res) => {
    res.send(req.user);
});

router.get("/start", (req, res) => {
    startBotCommand();
    res.send(200);
});

router.get("/stop", (req, res) => {
    stopBotCommand();
    res.send(200);
});

export default router;