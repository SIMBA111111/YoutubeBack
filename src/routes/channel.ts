import express from 'express'
import { getMyChannels, getChannelInfo, updateSubscribeChannel, updateNotifSetting } from '../controllers/channel'

export const router = express.Router();

router.get('/my-channels/:userId', getMyChannels);
router.post('/channel-info/:channelUsername', getChannelInfo);
// router.get('/check-is-sub/:userId/:channelId', getChannelInfo);

router.put('/subscribe', updateSubscribeChannel);
router.put('/notif-setting', updateNotifSetting);
