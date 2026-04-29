// routes/videos.js
import express from 'express'
import { 
    getPostsByChannelUsername, 
} from '../controllers/post'

export const router = express.Router();

router.get('/posts/by-username/:channelUsername', getPostsByChannelUsername);