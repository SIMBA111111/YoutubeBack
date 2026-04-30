// routes/videos.js
import express from 'express'
import { 
    getMeInfo,
    getMyLikedPlaylists,
    getMyLikedVideoList,
    getMyViewsHistory, 
} from '../controllers/me'

export const router = express.Router();

router.get('/me/:meId', getMeInfo);
router.get('/me/my-liked-videos/:meId', getMyLikedVideoList);
router.get('/me/my-liked-playlists/:meId', getMyLikedPlaylists);
router.get('/me/my-view-history/:meId', getMyViewsHistory);