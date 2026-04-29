import { Request, Response } from 'express';
import {getChannelsByUser, getChannelsByUsername} from '../repositories/channel'
import { pool } from '../utils/pg';

export const getMyChannels = async (req: Request, res: Response) => {
    console.log('getMyChannels');
    try {
        const data = JSON.parse(req.cookies.channelData || '')
        const { offset, limit } = req.query

        const channels = await getChannelsByUser(data.id, Number(offset) | 0, Number(limit) || 20)
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
    console.log('getChannelInfo');
    try {
        const { channelUsername } = req.params

        const channel = await getChannelsByUsername(channelUsername as string)
        if(!channel)
            return res.status(404).json({result: `Нет ни одного канала`})

        return res.status(200).json(channel)    
    } catch (error) {
        console.error('Error getChannelInfo: ', error);
        return res.status(500).json({ message: 'Internal server error getChannelInfo'})    
    }
}


export const subscribeChannel = async (req: Request, res: Response) => {
    console.log('subscribeChannel');
    try {
        const { channelId, userId, isSubscribed } = req.body;

        if (isSubscribed) {
            await pool.query(
                `DELETE FROM subscriptions 
                 WHERE follower_channel_id = $1 AND channel_id = $2`,
                [userId, channelId]
            );

            await pool.query(
                `UPDATE channels SET subscribers_count = subscribers_count - 1 WHERE id = $1`,
                [channelId]
            );

            return res.status(200).json({ 
                message: 'Unsubscribed successfully',
                isSubscribed: false 
            });
        } else {
            await pool.query(`
                INSERT INTO subscriptions (follower_channel_id, channel_id, notification_settings) 
                VALUES ($1, $2, true)
            `, [userId, channelId]
            );

            await pool.query(
                `UPDATE channels SET subscribers_count = subscribers_count + 1 WHERE id = $1`,
                [channelId]
            );

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

export const notifSetting = async (req: Request, res: Response) => {
    console.log('notifSetting');
    try {
        const { channelId, userId, isNotifSetting } = req.body;

        console.log('userId = ', userId);
        console.log('channelId = ', channelId);
        

        const result = await pool.query(
            `UPDATE subscriptions
             SET notification_settings = $1
             WHERE follower_channel_id = $2 AND channel_id = $3
             RETURNING notification_settings`,
            [isNotifSetting, userId, channelId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        return res.status(200).json({ 
            message: `Notification settings ${isNotifSetting ? 'enabled' : 'disabled'} successfully`,
            isNotifSetting: isNotifSetting
        });

    } catch (error) {
        console.error('Error notifSetting: ', error);
        return res.status(500).json({ message: 'Internal server error notifSetting'});
    }
};