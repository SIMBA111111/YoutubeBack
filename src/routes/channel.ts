import express from 'express'
import { getMyChannels, getChannelInfo, updateSubscribeChannel, updateNotifSetting } from '../controllers/channel'

export const router = express.Router();

router.get('/my-channels', getMyChannels);
router.get('/channel-info/:channelUsername', getChannelInfo);

router.put('/subscribe', updateSubscribeChannel);
router.put('/notif-setting', updateNotifSetting);
