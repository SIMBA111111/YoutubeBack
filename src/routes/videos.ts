// routes/videos.js
import express from 'express'
import { getVideos, getVideoById, getVideoListByName } from '../controllers/video'
// import { upload } from '../middleware/upload.js';

const router = express.Router();

console.log('🔵 Регистрация маршрутов видео...');

router.get('/videos', getVideos);
router.get('/videos/search/:name', getVideoListByName);
router.get('/videos/:id', getVideoById);

console.log('🟢 Маршруты видео зарегистрированы');
// router.post('/videos/create', upload, createVideo);

export default router;
