// routes/videos.js
import express from 'express'
import { 
    getVideos, 
    getVideosMySubs,
    getVideoById, 
    getRecommendedVideos, 
    getVideoListByName, 
    getTags, 
    updateMarkVideo,
    getVideosByChannelUsername,
    getShortVideosByChannelUsername,
    updateVideoViewCount,
    createVideo,
    deleteVideo,
    updateVideo,
    getVideoAnalytics,
    getVideosIds,
    getShortVideos,
    getVideosByName
} from '../controllers/video'
import { upload } from '../middlewares/upload';

const router = express.Router();

router.get('/tags', getTags);

router.get('/videos', getVideos);
router.get('/videos/by-name/:name', getVideosByName);
router.get('/videos/my-subs/:meId', getVideosMySubs);
router.post('/channel-videos/:channelUsername', getVideosByChannelUsername);
router.get('/channel-short-videos/:channelUsername', getShortVideosByChannelUsername);
router.post('/video/:videoId', getVideoById);
router.post('/recommended-videos/:videoId', getRecommendedVideos);
router.get('/videos-ids', getVideosIds);
router.get('/short-videos', getShortVideos);
router.get('/videos/search/:name', getVideoListByName);
router.get('/videos/:videoId', getVideoById);
router.post('/video-analytics/:videoId', getVideoAnalytics);

router.post('/mark/video/:videoId', updateMarkVideo);
router.get('/view/video/:videoId', updateVideoViewCount);
router.delete('/delete-video/:videoId', deleteVideo);
router.patch('/update-video/:videoId', updateVideo);

// router.post('/videos/create', upload, createVideo);
router.post('/create-video', upload, createVideo);

export default router;
