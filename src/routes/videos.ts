// routes/videos.js
import express from 'express'
import { getVideos, getVideoById, getVideoByHash, getRecommendedVideos, getVideoListByName, getTags, viewVideo, markVideo } from '../controllers/video'
// import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/tags', getTags);
router.get('/videos', getVideos);
router.post('/video/:hash', getVideoByHash);
router.post('/recommended-videos/:hash', getRecommendedVideos);
router.get('/videos/search/:name', getVideoListByName);
router.get('/videos/:id', getVideoById);

router.post('/mark/video/:videoId', markVideo);
router.patch('/view/video/:videoId', viewVideo);


// router.post('/videos/create', upload, createVideo);

export default router;
