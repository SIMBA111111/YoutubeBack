import { Request, Response } from 'express';
import {getChannelByUsername, getChannelsByUser, updateSubsCountChannel} from '../repositories/channel'
import { pool } from '../utils/pg';
import { createSubscribeChannel, createSubscription, updateSubscriptionNotifSettings } from '../repositories/subscriptions';

export const getMyChannels = async (req: Request, res: Response) => {
    try {
        const { meId } = req.params
        const { offset, limit } = req.query

        const channels = await getChannelsByUser(meId as string, Number(offset) | 0, Number(limit) || 20)
        if(!channels)
            return res.json({result: `Нет ни одной подписки`})

        const result = {
            channels: channels,
            total: channels.length
        }

        return res.status(200).json(result)    
    } catch (error) {
        console.error('Error getMyChannels: ', error);
        return res.status(500).json({ message: 'Internal server error getMyChannels'})    
    }
}


export const getChannelInfo = async (req: Request, res: Response) => {
    try {
        const { channelUsername } = req.params

        const channel = await getChannelByUsername(channelUsername as string)
        if(!channel)
            return res.status(404).json({result: `Нет канала`})

        return res.status(200).json(channel)    
    } catch (error) {
        console.error('Error getChannelInfo: ', error);
        return res.status(500).json({ message: 'Internal server error getChannelInfo'})    
    }
}


export const subscribeChannel = async (req: Request, res: Response) => {
    try {
        const { channelId, userId, isSubscribed } = req.body;

        if (isSubscribed) {
            await createSubscribeChannel(channelId, userId)

            await updateSubsCountChannel(channelId, 'decr')

            return res.status(200).json({ 
                message: 'Unsubscribed successfully',
                isSubscribed: false 
            });
        } else {
            await createSubscription(channelId, userId)

            await updateSubsCountChannel(channelId, 'inc')

            return res.status(200).json({ 
                message: 'Subscribed successfully',
                isSubscribed: true 
            });
        }

    } catch (error) {
        console.error('Error subscribeChannel: ', error);
        return res.status(500).json({ message: 'Internal server error subscribeChannel' });
    }
};

export const updateNotifSetting = async (req: Request, res: Response) => {
    try {
        const { channelId, userId, isNotifSetting } = req.body;

        await updateSubscriptionNotifSettings(channelId, userId, isNotifSetting)

        return res.status(200).json({ 
            message: `Notification settings ${isNotifSetting ? 'enabled' : 'disabled'} successfully`,
            isNotifSetting: isNotifSetting
        });

    } catch (error) {
        console.error('Error notifSetting: ', error);
        return res.status(500).json({ message: 'Internal server error notifSetting'});
    }
};