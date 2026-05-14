// routes/videos.js
import express from 'express'
import { 
    getMeInfo,
    getMyLikedPlaylists,
    getMyLikedVideoList,
    getMyViewsHistory, 
    deleteMyViewsHistory,
    updateSaveHistory
} from '../controllers/me'

export const router = express.Router();

router.get('/me/:meId', getMeInfo);
router.post('/me/my-liked-videos/:meId', getMyLikedVideoList);
router.get('/me/my-liked-playlists/:meId', getMyLikedPlaylists);
router.post('/me/my-view-history/:meId', getMyViewsHistory);
router.delete('/me/my-views-history/:meId', deleteMyViewsHistory);
router.patch('/me/update-save-history/:meId', updateSaveHistory);