import express from 'express'
import { getMyChannels } from '../controllers/channel'

export const router = express.Router();

router.get('/my-channels', getMyChannels);
