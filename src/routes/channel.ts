import express from 'express'
import { getMyChannels, getChannelInfo, subscribeChannel, updateNotifSetting } from '../controllers/channel'

export const router = express.Router();

router.get('/my-channels', getMyChannels);
router.get('/channel-info/:channelUsername', getChannelInfo);

router.put('/subscribe', subscribeChannel);
router.put('/notif-setting', updateNotifSetting);
