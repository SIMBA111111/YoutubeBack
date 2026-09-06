import express from 'express'
import { Request, Response } from "express";
import { getNumberParam, getStringParam, getBooleanParam } from '../../shared/utils/paramsParse';
import { ApiResponseDTO } from '../../shared/dtos/response.dto';
import { ChannelService } from './channel.service';
import { ChannelRepository } from './channel.repository';
import { AnalyticsDateRange, TTab } from './domain/channel.consts';
import { SubscriptionRepository } from '../subscription/subscription.repository';
import { updateChannel } from '../../middlewares/updateChannel';

export const router = express.Router();

const channelRepository = new ChannelRepository()
const subscriptionRepository = new SubscriptionRepository()
const channelService = new ChannelService(channelRepository, subscriptionRepository)


router.get('/my-channels/:channelId', async (req: Request, res: Response) => {
  try {
    const channelId = getStringParam(req.params.channelId)
    const offset = getNumberParam(req.query.offset)
    const limit = getNumberParam(req.query.limit)

    const result = await channelRepository.getChannelsByFollowerId(channelId, limit, offset)

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});


router.post('/channel-info/:channelUsername', async (req: Request, res: Response) => {
  try {
    const channelUsername = getStringParam(req.params.channelUsername)
    const userId = getStringParam(req.body.userId)
    
    const result = await channelService.getChannelInfo(channelUsername, userId)
    
    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});


// эта ручка в точности дублирует верхнюю
// router.get('/channel-info-by-id/:channelId', async (req: Request, res: Response) => {
//   try {
//     const channelUsername = getStringParam(req.params.channelUsername)
//     const userId = getStringParam(req.body.userId)
//     let subData = null

//     const channel = await getChannelByUsername(channelUsername as string);
//     if(userId) {
//       subData = await getIsSubOnChannelInfo(userId as string, channel.id as string);
//     }

//     if (!channel) return res.status(404).json({ result: `Нет канала` });

//     const result = {
//       channel: channel,
//       subData: subData
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("Error getChannelInfo: ", error);
//     return res
//       .status(500)
//       .json({ message: "Internal server error getChannelInfo" });
//   }
// });


router.post('/channel-analytics/:channelId', async (req: Request, res: Response) => {
  try {
    const channelId = getStringParam(req.params.channelId)
    const dateRange = getStringParam(req.body.dateRange)
    const tab = getStringParam(req.body.tab)

    const result = await channelService.getChannelAnalyticService(channelId, dateRange as AnalyticsDateRange, tab as TTab)

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});


// router.get('/check-is-sub/:userId/:channelId', getChannelInfo);


router.put('/subscribe', async (req: Request, res: Response) => {
  try {
    const channelId = getStringParam(req.body.channelId);
    const userId= getStringParam(req.body.userId);
    const isSubscribed = getBooleanParam(req.body.isSubscribed);

    const result = await channelService.subscribeChannel(channelId, userId, isSubscribed)

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});


router.put('/notif-setting', async (req: Request, res: Response) => {
  try {
    const { channelId, userId, isNotifSetting } = req.body;

    const subSettings = await subscriptionRepository.updateSubscriptionNotifSettings(channelId, userId, isNotifSetting);

    const result = {
      message: `Notification settings ${
        isNotifSetting ? "enabled" : "disabled"
      } successfully`,
      isNotifSetting: subSettings.notification_settings,
    }

    return res.status(200).json(ApiResponseDTO.success(result))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});



router.put('/channel-update/:channelId', updateChannel, async (req: Request, res: Response) => {
  try {
    const channelId = getStringParam(req.params.channelId)

    if (!channelId) return res.status(400).json(ApiResponseDTO.error('Is required propertry: channelId'))

    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json(ApiResponseDTO.error('No fields to update'))
    }

    const updatedChannel = await channelService.updateChannelData(channelId, body)

    return res.status(200).json(ApiResponseDTO.success(updatedChannel))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
});
