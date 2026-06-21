import express from 'express'
import { getMyChannels, getChannelInfo, updateSubscribeChannel, updateNotifSetting, getChannelInfoById, updateChannelInfo } from '../controllers/channel'
import { updateChannel, updateChannelWithCleanup } from '../middlewares/updateChannel';

export const router = express.Router();

router.get('/my-channels/:userId', getMyChannels);
router.post('/channel-info/:channelUsername', getChannelInfo);
router.get('/channel-info-by-id/:userId', getChannelInfoById);
// router.get('/check-is-sub/:userId/:channelId', getChannelInfo);

router.put('/subscribe', updateSubscribeChannel);
router.put('/notif-setting', updateNotifSetting);
router.put('/channel-update/:channelId', updateChannel, updateChannelInfo);
