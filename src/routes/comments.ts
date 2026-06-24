import express from "express";
import {
  createComment,
  deleteComment,
  markComment,
  replyComment,
  getRepliesComment,
  getCommentsByVideoId,
} from "../controllers/comments";

export const router = express.Router();

router.post("/replies-comments/:parentCommentId", getRepliesComment);
router.post("/comments/:videoId", getCommentsByVideoId);

router.post("/comment/create/:videoId", createComment);
router.delete("/comment/delete/:commentId", deleteComment);
router.post("/comment/mark/:commentId", markComment);
router.post("/comment/reply/:parentCommentId", replyComment);
