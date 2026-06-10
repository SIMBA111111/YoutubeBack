// routes/videos.js
import express from 'express'
import { 
    getVideos, 
    getVideosMySubs,
    getVideoById, 
    getVideoByHash, 
    getRecommendedVideos, 
    getVideoListByName, 
    getTags, 
    updateMarkVideo,
    getVideosByChannelUsername,
    getShortVideosByChannelUsername,
    updateVideoViewCount,
    event,
    createVideo,
    deleteVideo
} from '../controllers/video'
import { upload } from '../middlewares/upload';

const router = express.Router();

router.get('/event', event);
router.get('/tags', getTags);

router.get('/videos', getVideos);
router.get('/videos/my-subs/:meId', getVideosMySubs);
router.post('/channel-videos/:channelUsername', getVideosByChannelUsername);
router.get('/channel-short-videos/:channelUsername', getShortVideosByChannelUsername);
router.post('/video/:hash', getVideoByHash);
router.post('/recommended-videos/:hash', getRecommendedVideos);
router.get('/videos/search/:name', getVideoListByName);
router.get('/videos/:id', getVideoById);

router.post('/mark/video/:videoId', updateMarkVideo);
router.get('/view/video/:videoId', updateVideoViewCount);
router.get('/delete-video/:videoId', deleteVideo);


// router.post('/videos/create', upload, createVideo);
router.post('/create-video', upload, createVideo);

export default router;
