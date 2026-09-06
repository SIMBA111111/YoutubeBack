// routes/videos.js
import { Request, Response } from "express";
import express from 'express'
import { upload } from '../../middlewares/upload';
import { VideoRepository } from "./video.repository";
import { VideoService } from "./video.service";
import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { getNumberParam, getStringParam, getBooleanParam, getArrayParam } from "../../shared/utils/paramsParse";
import { TVideoAgeFilter } from "./domain/video.consts";
import { ChannelRepository } from "../channel/channel.repository";
import { StatisticRepository } from "../statistic/statistic.repository";
import { SubscriptionRepository } from "../subscription/subscription.repository";

const router = express.Router();

const videoRepository = new VideoRepository()
const channelRepository = new ChannelRepository()
const statisticRepository = new StatisticRepository()
const subscriptionRepository = new SubscriptionRepository()

const videoService = new VideoService(videoRepository, channelRepository, statisticRepository, subscriptionRepository)

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

    const videos = await videoService.getVideoListBySubs(followerId, offset, limit, onlyShorts, onlyFull)

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.post('/channel-videos/:channelUsername', async (req: Request, res: Response) => {
  console.log("getVideoListByOwnerUsername");
  try {
    const channelUsername = getStringParam(req.params.channelUsername)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)
    const filter = getStringParam(req.body.filter)
    const isShort = getBooleanParam(req.body.isShort)

    const videos = await videoRepository.getVideoListByOwnerUsername(
      channelUsername,
      filter as TVideoAgeFilter,
      isShort,
      offset,
      limit
    );

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


// этот можно выпелить, тк по верхней ручке можно сделать то же самое
// router.get('/channel-short-videos/:channelUsername', getShortVideosByOwnerUsername);

router.post('/video/:videoId', async (req: Request, res: Response) => {
  console.log("==========getVideoById=======");
  try {
    const videoId = getStringParam(req.params.videoId)
    const channelId = getStringParam(req.query.channelId)

    const result = await videoService.getVideoById(videoId, channelId)

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.post('/recommended-videos/:videoId', async (req: Request, res: Response) => {
  console.log("getRecommendedVideos");
  try {
    const videoId = getStringParam(req.params.videoId)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)

    const response = await videoRepository.getRecommendedVideos(
      videoId,
      offset,
      limit,
    );

    return res.status(200).json(ApiResponseDTO.success(response))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});



router.get('/videos-ids', async (req: Request, res: Response) => {
  console.log("getShortVideosIds");
  try {
    const offset = getNumberParam(req.query.offset) 
    const limit = getNumberParam(req.query.limit)
    const isShortVideo = getBooleanParam(req.query.isShortVideo)

    const response = await videoRepository.getVideosIds(offset, limit, isShortVideo);

    return res.status(200).json(ApiResponseDTO.success(response))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


// Этот точечно можно заменить ручкой /video, но там по-моему проблему есть с отдечей по флагу isShort. Надо просто ту ручку фиксануть
// router.get('/short-videos', getShortVideos);


router.get('/videos/search/:name', async (req: Request, res: Response) => {
  console.log("getVideoListByName");
  try {
    const videoName = getStringParam(req.params.name)
    const offset = getNumberParam(req.params.offset)
    const limit = getNumberParam(req.params.limit)

    const videos = await videoRepository.getVideoListByName(videoName, offset, limit, true);

    return res.status(200).json(ApiResponseDTO.success(videos))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.get('/view/video/:videoId', async (req: Request, res: Response) => {
  console.log(
    "updateVideoViewCount updateVideoViewCount updateVideoViewCount updateVideoViewCount updateVideoViewCount updateVideoViewCount"
  );
  try {
    const videoId = getStringParam(req.params.videoId)
    const viewerId = getStringParam(req.query.viewerId)

    const result = await videoService.updateViewVideo(videoId, viewerId) 

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});



router.post('/video-analytics/:videoId', async (req: Request, res: Response) => {
  console.log("getVideoAnalytics")
  try {
    const videoId = getStringParam(req.params.videoId)
    const dateRange = getStringParam(req.body.dateRange)

    const result = await videoService.getVideoAnalytics(videoId, dateRange)

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.post('/mark/video/:videoId', async (req: Request, res: Response) => {
  console.log("updateMarkVideo");
  try {
    const videoId = getStringParam(req.params.videoId)
    const userId = getStringParam(req.body.userId)
    const isLiked = getBooleanParam(req.body.isLiked)
    const isDisliked = getBooleanParam(req.body.isDisliked)

    const updatedVideoStatEntity = await videoService.updateMarkVideo(videoId, userId, isLiked, isDisliked)

    return res.status(200).json(ApiResponseDTO.success(updatedVideoStatEntity))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.delete('/delete-video/:videoId', async (req: Request, res: Response) => {
  console.log(
    "deleteVideo"
  );
  try {
    const videoId = getStringParam(req.params.videoId)

    const isDeleted = await videoService.deleteVideoService(videoId)

    return res.status(200).json(ApiResponseDTO.success(isDeleted))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


router.patch('/update-video/:videoId', async (req: Request, res: Response) => {
  console.log("updateVideo");
  try {
    const videoId = getStringParam(req.params.videoId)
    const iconPreview = getStringParam(req.body.formData.iconPreview)
    const videoName = getStringParam(req.body.formData.videoName)
    const videoDescription = getStringParam(req.body.formData.videoDescription)
    const hashTags = getArrayParam(req.body.formData.hashTags)
    const tags = getArrayParam(req.body.formData.tags)
    const playlistIds = getArrayParam(req.body.formData.playlistIds)

    const updatedVideo = await videoService.updateVideo(videoId, iconPreview, videoName, videoDescription, hashTags, tags, playlistIds)

    return res.status(200).json(ApiResponseDTO.success(updatedVideo))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
});


// router.post('/videos/create', upload, createVideo);
router.post('/create-video', upload, async (req: Request, res: Response) => {
  console.log("createVideo");

  try {
    const videoId = getStringParam(req.videoId)
    const channelId = getStringParam(req.body.userId);
    const videoName = getStringParam(req.body.videoData.videoName);
    const videoDescription = getStringParam(req.body.videoData.videoDescription);
    const videoPreview = getStringParam(req.body.videoData.videoPreview);
    const playlistIds = getArrayParam(req.body.videoData.playlistIds);
    const fragments = getArrayParam(req.body.videoData.fragments);
    const videoAccess = getStringParam(req.body.videoData.videoAccess);
    const hashTags = getArrayParam(req.body.videoData.hashTags);
    const tags = getArrayParam(req.body.videoData.tags);
    const isShort = getBooleanParam(req.body.videoData.isShort);

    const videoService.createVideo()


    return res.status(201).json("Video created succesfully");
  } catch (error) {
    console.error("Error createVideo:", error);
    res.status(500).json({ error: "Internal server error2" });
  }
});

export default router;
