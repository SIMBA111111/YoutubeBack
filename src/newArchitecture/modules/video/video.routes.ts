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
    const isShorts = getBooleanParam(req.query.isShorts)
    const channelData = getStringParam(req.cookies.channelData)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)

    const videos = await videoService.getVideos(tagName, isShorts, channelData, offset, limit)

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
})


router.get('/videos/by-name/:name', async (req: Request, res: Response) => {
  console.log("getVideosByName");

  try {
    const name = getStringParam(req.params.name)
    const limit = getNumberParam(req.query.limit)
    const offset = getNumberParam(req.query.offset)
    
    const videos = await videoRepository.getVideoListByName(name, offset, limit, true)

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});



router.get('/videos-my-subs/:meId', async (req: Request, res: Response) => {
  try {
    const followerId = getStringParam(req.params.followerId)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)
    const onlyShorts = getBooleanParam(req.query.onlyShorts)
    const onlyFull = getBooleanParam(req.query.onlyFull)

    const videos = videoService.getVideoListBySubs(followerId, offset, limit, onlyShorts, onlyFull)

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.post('/channel-videos/:channelUsername', async (req: Request, res: Response) => {
  console.log("getVideosByChannelUsername");
  try {
    const channelUsername = getStringParam(req.params.channelUsername)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)
    const filter = getStringParam(req.body.filter)
    const isShort = getBooleanParam(req.body.isShort)

    const response = await getVideoListByOwnerUsername(
      channelUsername as string,
      filter,
      isShort,
      offset as string,
      limit as string
    );

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});



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
