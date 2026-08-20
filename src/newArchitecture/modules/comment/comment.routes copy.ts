import { Request, Response } from "express";
import express from "express";
import { RepliesCommentsRequestDTO } from "./dtos/comment.replies-comments.dto";
import { getNumberParam, getStringParam } from "../../shared/utils/paramsParse";
import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { СommentService } from "./comment.service";
import { CommentRepository } from "./comment.repository";
import { TCommentFilters } from "./comment.consts";

export const router = express.Router();

const commentRepository = new CommentRepository();
const commentService = new СommentService(commentRepository);

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
    const videoId = req.params.videoId;
    const commentText = req.body.commentText;
    const userId = req.body.userId;

    

    const response = await crateCommentRepo(
      commentText,
      videoId as string,
      userId
    );

    if(response) {
      await updateVideoCommentCount(videoId as string)
    }

    const result = {
      newComment: response,
    };

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error createComment:", error);
    res.status(500).json({ error: "Internal server error2" });
  }
});

// router.delete("/comment/delete/:commentId", deleteComment);

// router.post("/comment/mark/:commentId", markComment);

// router.post("/comment/reply/:parentCommentId", replyComment);
