import express from 'express'
import { getMyChannels, subscribeChannel, notifSetting } from '../controllers/channel'

export const router = express.Router();

router.get('/my-channels', getMyChannels);

router.put('/subscribe', subscribeChannel);
router.put('/notif-setting', notifSetting);
