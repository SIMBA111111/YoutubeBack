import { Request, Response } from "express";
import {
  getChannelByUsername,
  getChannelsByUser,
  getIsSubOnChannelInfo,
  updateSubsCountChannel,
} from "../repositories/channel";
import { pool } from "../utils/pg";
import {
  createSubscription,
  createUnsubscribeChannel,
  updateSubscriptionNotifSettings,
} from "../repositories/subscriptions";

export const getMyChannels = async (req: Request, res: Response) => {
  try {
    const { userId: meId } = req.params;
    const { offset, limit } = req.query;

    let userId = meId || JSON.parse(req.cookies.channelData).id;

    const channels = await getChannelsByUser(
      userId as string,
      Number(offset) | 0,
      Number(limit) || 20
    );
    if (!channels) return res.json({ result: `Нет ни одной подписки` });

    const result = {
      channels: channels,
      total: channels.length,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getMyChannels: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error getMyChannels" });
  }
};

export const getChannelInfo = async (req: Request, res: Response) => {
  try {
    const { channelUsername } = req.params;
    const { userId } = req.body

    const channel = await getChannelByUsername(channelUsername as string);
    const subData = await getIsSubOnChannelInfo(userId as string, channel.id as string);
    if (!channel) return res.status(404).json({ result: `Нет канала` });

    console.log('subData = ', subData);
    console.log('req.body = ', req.body);
    

    const result = {
      channel: channel,
      subData: subData ?? {}
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getChannelInfo: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error getChannelInfo" });
  }
};

export const updateSubscribeChannel = async (req: Request, res: Response) => {
  try {
    const { channelId, userId, isSubscribed } = req.body;

    console.log("isSubscribed = ", isSubscribed);
    let updatedSub;

    if (isSubscribed) {
      updatedSub = await createUnsubscribeChannel(channelId, userId);

      await updateSubsCountChannel(channelId, "decr");

      return res.status(200).json({
        message: "Unsubscribed successfully",
        isSubscribed: false,
      });
    } else {
      updatedSub = await createSubscription(channelId, userId);

      await updateSubsCountChannel(channelId, "inc");

      return res.status(200).json({
        message: "Subscribed successfully",
        isSubscribed: true,
      });
    }
  } catch (error) {
    console.error("Error subscribeChannel: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error subscribeChannel" });
  }
};

export const updateNotifSetting = async (req: Request, res: Response) => {
  try {
    const { channelId, userId, isNotifSetting } = req.body;

    await updateSubscriptionNotifSettings(channelId, userId, isNotifSetting);

    return res.status(200).json({
      message: `Notification settings ${
        isNotifSetting ? "enabled" : "disabled"
      } successfully`,
      isNotifSetting: isNotifSetting,
    });
  } catch (error) {
    console.error("Error notifSetting: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error notifSetting" });
  }
};
