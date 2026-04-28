import { Request, Response } from 'express';
import {getChannelsByUser} from '../repositories/channel'
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
            return res.status(200).json({ 
                message: 'Unsubscribed successfully',
                isSubscribed: false 
            });
        } else {
            await pool.query(
                `INSERT INTO subscriptions (follower_channel_id, channel_id, notification_settings) 
                 VALUES ($1, $2, true)
                 ON CONFLICT (follower_channel_id, channel_id) DO NOTHING`,
                [userId, channelId]
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

        // Устанавливаем значение в зависимости от isNotifSetting
        const notificationValue = !isNotifSetting; // если isNotifSetting true → false, если false → true

        const result = await pool.query(
            `UPDATE subscriptions
             SET notification_settings = $1
             WHERE follower_channel_id = $2 AND channel_id = $3
             RETURNING notification_settings`,
            [notificationValue, userId, channelId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        return res.status(200).json({ 
            message: `Notification settings ${notificationValue ? 'enabled' : 'disabled'} successfully`,
            isNotifSetting: notificationValue
        });

    } catch (error) {
        console.error('Error notifSetting: ', error);
        return res.status(500).json({ message: 'Internal server error notifSetting'});
    }
};