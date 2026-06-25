import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { getVideoByHashRepo, getVideoByIdRepo, updateVideoCommentCount } from "../repositories/video";
import { mapCommentsToIComment } from "../utils/maps/mapComment";
import {
  crateCommentRepo,
  deleteCommentRepo,
  getCommentsByParentCommentId,
  getCommentsByVideoHashRepo,
} from "../repositories/comment";
import { getVideoById } from "./video";

export const getCommentsByVideoId = async (req: Request, res: Response) => {
  console.log("getCommentsByVideoHash");
  try {
    const { videoId } = req.params;
    const { parentCommentId, filter, userId } = req.body;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;

    let comments = [];

    if (parentCommentId) {
      comments = await getCommentsByParentCommentId(
        parentCommentId,
        offset,
        limit,
        userId
      );
    } else {
      const videoData = await getVideoByIdRepo(videoId as string)

      console.log('videoData = ', videoData);
      

      const video = await getVideoByHashRepo(videoData.video_hash as string);

      console.log('video = ', video);

      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      comments = await getCommentsByVideoHashRepo(
        videoId as string,
        offset,
        limit,
        filter,
        userId
      );
    }

    console.log('comments = ', comments);
    

    const result = {
      comments: mapCommentsToIComment(comments),
      total: comments.length,
      offset,
      limit,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getCommentsByVideoHash:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRepliesComment = async (req: Request, res: Response) => {
  console.log("getRepliesComment");
  try {
    const { parentCommentId } = req.params;
    console.log("parentCommentId ============ ", parentCommentId);
    console.log("req.body ============ ", req.body);

    const { userId } = req.body;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;

    const response = await getCommentsByParentCommentId(
      parentCommentId as string,
      offset,
      limit,
      userId
    );

    const result = {
      comments: mapCommentsToIComment(response),
      total: response.length,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getRepliesComment:", error);
    res.status(500).json({ error: "Internal server error2" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  console.log("createComment");
  try {
    const { videoId } = req.params;
    const { commentText, userId } = req.body;
    const cookies = req.cookies;

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
};


export const deleteComment = async (req: Request, res: Response) => {
  console.log("deleteComment");
  try {
    const { commentId } = req.params;

    const response = await deleteCommentRepo(
      commentId as string,
    );

    const result = {
      deletedComment: true,
    };

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error deleteComment:", error);
    res.status(500).json({ error: "Internal server error2" });
  }
};


export const markComment = async (req: Request, res: Response) => {
  console.log("markComment");
  try {
    const { commentId } = req.params;
    const { userId, isLiked, isDisliked } = req.body;

    // Проверяем, существует ли запись статистики
    const commentStatRes = await pool.query(
      `SELECT * FROM stat_of_comments WHERE channel_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );
    const oldStat = commentStatRes.rows[0];

    let oldLiked = false;
    let oldDisliked = false;

    if (oldStat) {
      oldLiked = oldStat.liked;
      oldDisliked = oldStat.disliked;

      // Обновляем существующую запись
      await pool.query(
        `UPDATE stat_of_comments 
                 SET liked = $1, disliked = $2 
                 WHERE channel_id = $3 AND comment_id = $4`,
        [isLiked, isDisliked, userId, commentId]
      );
    } else {
      // Создаем новую запись
      await pool.query(
        `
                INSERT INTO stat_of_comments (channel_id, comment_id, liked, disliked) 
                VALUES ($1, $2, $3, $4)
            `,
        [userId, commentId, isLiked, isDisliked]
      );
    }

    // Обновляем счетчики rjvvtynf
    // Сначала обрабатываем лайки
    if (oldLiked !== isLiked) {
      if (isLiked) {
        await pool.query(
          `UPDATE comments SET like_count = like_count + 1 WHERE id = $1`,
          [commentId]
        );
      } else {
        await pool.query(
          `UPDATE comments SET like_count = like_count - 1 WHERE id = $1`,
          [commentId]
        );
      }
    }

    // Обрабатываем дизлайки
    if (oldDisliked !== isDisliked) {
      if (isDisliked) {
        await pool.query(
          `UPDATE comments SET dislike_count = dislike_count + 1 WHERE id = $1`,
          [commentId]
        );
      } else {
        await pool.query(
          `UPDATE comments SET dislike_count = dislike_count - 1 WHERE id = $1`,
          [commentId]
        );
      }
    }

    console.log("userId = ", userId);
    console.log("commentId = ", commentId);

    // Получаем обновленную статистику для ответа
    const updatedStatsRes = await pool.query(
      `SELECT liked, disliked FROM stat_of_comments 
             WHERE channel_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );

    const updatedCommentRes = await pool.query(
      `SELECT like_count, dislike_count FROM comments 
             WHERE id = $1`,
      [commentId]
    );

    res.status(200).json({
      success: true,
      stats: updatedStatsRes.rows[0] || {},
      comment: updatedCommentRes.rows[0] || {},
    });
  } catch (error) {
    console.error("Error markComment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const replyComment = async (req: Request, res: Response) => {
  console.log("replyComment");
  try {
    const { parentCommentId } = req.params;
    const { commentText, userId, videoId } = req.body;
    const cookies = req.cookies;

    const response = await pool.query(
      `
            INSERT INTO comments (text, video_id, channel_id, parent_comment_id)
            VALUES ($1, $2, $3, $4)
        `,
      [commentText, videoId, userId, parentCommentId]
    );

    return res.status(201).json("replied comment");
  } catch (error) {
    console.error("Error replyComment:", error);
    res.status(500).json({ error: "Internal server error2" });
  }
};
