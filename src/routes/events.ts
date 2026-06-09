import express from "express";
import {
    videoProcess
} from "../controllers/event";

export const router = express.Router();

router.get("/video-process/:userId", videoProcess);