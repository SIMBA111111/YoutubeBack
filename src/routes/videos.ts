// routes/videos.js
import express from 'express'
import { getVideos, getVideoById, getVideoByHash, getRecommendedVideos, getVideoListByName, getTags } from '../controllers/video'
// import { upload } from '../middleware/upload.js';

const router = express.Router();

console.log('🔵 Регистрация маршрутов видео...');

router.get('/tags', getTags);
router.get('/videos', getVideos);
router.post('/video/:hash', getVideoByHash);
router.post('/recommended-videos/:hash', getRecommendedVideos);
router.get('/videos/search/:name', getVideoListByName);
router.get('/videos/:id', getVideoById);

console.log('🟢 Маршруты видео зарегистрированы');
// router.post('/videos/create', upload, createVideo);

export default router;
