// routes/videos.js
import { Request, Response } from "express";
import express from 'express'
import { upload } from '../../middlewares/upload';
import { VideoRepository } from "./video.repository";
import { VideoService } from "./video.service";
import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { getNumberParam, getStringParam, getBooleanParam } from "../../shared/utils/paramsParse";

const router = express.Router();

const videoRepository = new VideoRepository()
const videoService = new VideoService(videoRepository)

router.get('/tags', async (req: Request, res: Response) => {
  console.log("getTags");
  try {
    const response = await videoRepository.getAllTags()
    
    return res.status(200).json(ApiResponseDTO.success(response))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.get('/videos', async (req: Request, res: Response) => {
  console.log("getVideos");

  try {
    const tagName = getStringParam(req.query.tagName)
    const isShorts = getStringParam(req.query.isShorts)
    const channelData = getStringParam(req.cookies.channelData)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)


    console.log('videos: ', response);
    console.log('mapVideosToIVideo(videos): ', mapVideosToIVideo(response));

    const result = {
      videos: mapVideosToIVideo(response),
      total: response.length,
    };

    res.json(result);
  } catch (error) {
    console.error("Error getVideos:", error);
    res.status(500).json({ error: "Internal server error1" });
  }
};);







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
