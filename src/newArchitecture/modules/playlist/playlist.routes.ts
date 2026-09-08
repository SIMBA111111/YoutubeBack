import { Request, Response } from "express";
import express from "express";

export const router = express.Router();

router.get('/playlists/by-username/:channelUsername', getPlaylistsByChannelUsername);
router.post('/playlists/create', createPlaylist);
router.post('/playlists-by-id', getPlaylistById);