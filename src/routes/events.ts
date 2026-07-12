import express from "express";
import {
    notifEvent,
    videoProcess
} from "../controllers/event";

export const router = express.Router();

router.get("/video-process/:userId", videoProcess);
router.get('/notif-event/:userId', notifEvent);
