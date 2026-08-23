import { Request, Response } from "express";
import express from "express";
import { RepliesCommentsRequestDTO } from "./dtos/comment.replies-comments.dto";
import { getNumberParam, getStringParam, getBooleanParam } from "../../shared/utils/paramsParse";
import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { СommentService } from "./comment.service";
import { CommentRepository } from "./comment.repository";
import { TCommentFilters } from "./comment.consts";
import { VideoRepository } from "../video/video.repository";
import { StatisticRepository } from "../statistic/statistic.repository";

export const router = express.Router();

const commentRepository = new CommentRepository();
const videoRepository = new VideoRepository();
const statisticRepository = new StatisticRepository()
const commentService = new СommentService(commentRepository, videoRepository, statisticRepository);

router.post("/replies-comments/:parentCommentId", async (req: Request, res: Response) => {
    try {
        const parentCommentId = getStringParam(req.params.parentCommentId);
        const userId = getStringParam(req.body.userId);
        const offset = getNumberParam(req.query.offset, 0);
        const limit = getNumberParam(req.query.limit, 10);

        const requestData = new RepliesCommentsRequestDTO({
            parentCommentId, 
            userId,
            offset, 
            limit
        });

        const result = await commentService.getRepliesComment(
            requestData.parentCommentId,
            requestData.userId,
            requestData.offset,
            requestData.limit
        ) 
        
        res.status(200).json(ApiResponseDTO.success(result));

    } catch (error: any) {
        res.status(400).json(ApiResponseDTO.error(error.message));
    }
});

router.post("/comments/:videoId", async (req: Request, res: Response) => {
  try {
    const videoId = getStringParam(req.params.videoId)
    const filter = getStringParam(req.body.filter)
    const userId = getStringParam(req.body.userId)
    const offset = getNumberParam(req.query.offset, 0)
    const limit = getNumberParam(req.query.limit, 10)

    const result = await commentService.getComments(videoId, userId, filter as TCommentFilters, offset, limit)

    res.status(200).json(ApiResponseDTO.success(result));

  } catch (error: any) {
    res.status(400).json(ApiResponseDTO.error(error.message));
  }
});

router.post("/comment/create/:videoId", async (req: Request, res: Response) => {
  console.log("createComment");
  try {
    const videoId = getStringParam(req.params.videoId);
    const commentText = getStringParam(req.body.commentText);
    const userId = getStringParam(req.body.userId);

    const result = await commentService.createComment(commentText, videoId, userId)

    return res.status(201).json(ApiResponseDTO.success(result));
  } catch (error: any) {
    res.status(500).json(ApiResponseDTO.error(error));
  }
});

router.delete("/comment/delete/:commentId", async (req: Request, res: Response) => {
  console.log("deleteComment");
  try {
    const commentId = getStringParam(req.params.commentId)

    const isDeleted = commentRepository.deleteComment(commentId)

    if (isDeleted) {
        return res.status(201).json(ApiResponseDTO.success(isDeleted));
    }
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});

router.post("/comment/mark/:commentId", async (req: Request, res: Response) => {
  console.log("markComment");
  try {
    const commentId = getStringParam(req.params.commentId)
    const userId =  getStringParam(req.body.userId)
    const isLiked = getBooleanParam(req.body.isLiked)
    const isDisliked = getBooleanParam(req.body.isDisliked)

    const result = await commentService.markComment(commentId, userId, isLiked, isDisliked)    

    if (!result) {
        return res.status(500).json(ApiResponseDTO.error('Unknown error'));
    }

    return res.status(200).json(ApiResponseDTO.success(result))

  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});

router.post("/comment/reply/:parentCommentId", async (req: Request, res: Response) => {
  console.log("replyComment");
  try {
    const parentCommentId = getStringParam(req.params.parentCommentId);
    const commentText = getStringParam(req.body.commentText)
    const userId = getStringParam(req.body.userId)
    const videoId = getStringParam(req.body.videoId)

    const result = commentRepository.createReplyComment(commentText, videoId, userId, parentCommentId)

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error))
  }
})
