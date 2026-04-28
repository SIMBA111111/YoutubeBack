import express from 'express'
import { createComment, getCommentsByVideoHash } from '../controllers/comments'

export const router = express.Router();

router.post('/comments/:videoHash', getCommentsByVideoHash);

router.post('/create/comment/:videoHash', createComment);
