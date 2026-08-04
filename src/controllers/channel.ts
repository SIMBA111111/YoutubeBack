import { Request, Response } from "express";
import {
  getChannelById,
  getChannelByUsername,
  getChannelsByUser,
  getIsSubOnChannelInfo,
  updateSubsCountChannel,
} from "../repositories/channel";
import {
  createSubscription,
  createUnsubscribeChannel,
  getSubscription,
  updateSubscribeChannelRepo,
  updateSubscriptionNotifSettings,
} from "../repositories/subscriptions";
import { pool } from "../utils/pg";
import { getChannelAnalyticService } from "../services/channels/getChannelAnalyticService";

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
    let subData = null

    const channel = await getChannelByUsername(channelUsername as string);
    if(userId) {
      subData = await getIsSubOnChannelInfo(userId as string, channel.id as string);
    }

    if (!channel) return res.status(404).json({ result: `Нет канала` });

    const result = {
      channel: channel,
      subData: subData
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getChannelInfo: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error getChannelInfo" });
  }
};



export const getChannelInfoById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const channel = await getChannelById(userId as string);
    const subData = await getIsSubOnChannelInfo(userId as string, channel.id as string);
    if (!channel) return res.status(404).json({ result: `Нет канала` });

    const result = {
      channel: channel,
      subData: subData
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

    let updatedSub;

    if (isSubscribed) {
      updatedSub = await createUnsubscribeChannel(channelId, userId);

      await updateSubsCountChannel(channelId, "decr");

      return res.status(200).json({
        message: "Unsubscribed successfully",
        isSubscribed: false,
      });
    } else {
      const subEntity = await getSubscription(channelId, userId);
      
      if (!subEntity) {
        updatedSub = await createSubscription(channelId, userId);
      } else {
        updatedSub = await updateSubscribeChannelRepo(channelId, userId);
      }


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


export const updateChannelInfo = async (req: Request, res: Response) => {
  try {
    const channelId = req.params.channelId;
    if (!channelId) return res.status(400).json({ message: 'channelId required' });

    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Маппинг полей
    const fieldMapping: Record<string, string> = {
      channelDescription: 'description',
      avatarUrl: 'avatar_url',
      bannerUrl: 'banner_url',
      channelName: 'name',
    };

    const updatableFields = [
      'name', 'username', 'email', 'avatar_url', 'banner_url',
      'description', 'country', 'links', 'notification_setting', 'is_save_history'
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(body)) {
      if (key === 'oldBannerUrl' || key === 'oldAvatarUrl') continue;

      let dbField = fieldMapping[key] || key;
      if (!updatableFields.includes(dbField)) continue;

      let processedValue = value;
      if (dbField === 'links' && typeof value === 'string') {
        processedValue = value
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        // для PostgreSQL массив передаётся как ARRAY[...]
        updates.push(`${dbField} = $${paramIndex}::text[]`);
        values.push(processedValue);
      } else {
        updates.push(`${dbField} = $${paramIndex}`);
        values.push(processedValue);
      }
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(channelId);
    const sql = `
      UPDATE channels
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    return res.status(200).json({
      message: 'Channel updated',
      channel: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal error' });
  }
};


export const getChannelAnalytic = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { dateRange, tab } = req.body

    console.log('tab = ', tab);
    console.log('dateRange = ', dateRange);

    const { analyticData, totalViews, totalSubscriptions } = await getChannelAnalyticService(channelId as string, dateRange, tab)

    return res.status(200).json({result: {
        analyticData: analyticData,
        totalViews: totalViews, 
        totalSubscriptions: totalSubscriptions
      }
    })

  } catch (error) {
    console.error("Error notifSetting: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error notifSetting" });
  }
};