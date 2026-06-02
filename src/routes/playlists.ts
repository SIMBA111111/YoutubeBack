// routes/videos.js
import express from 'express'
import { 
    getPlaylistsByChannelUsername,
    createPlaylist 
} from '../controllers/playlist'

export const router = express.Router();

router.get('/playlists/by-username/:channelUsername', getPlaylistsByChannelUsername);
router.post('/playlists/create', createPlaylist);