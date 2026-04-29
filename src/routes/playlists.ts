// routes/videos.js
import express from 'express'
import { 
    getPlaylistsByChannelUsername, 
} from '../controllers/playlist'

export const router = express.Router();

router.get('/playlists/by-username/:channelUsername', getPlaylistsByChannelUsername);