import express from 'express'
import { getCommentsByVideoHash } from '../controllers/comments'

export const router = express.Router();

router.post('/comments/:videoHash', getCommentsByVideoHash);
