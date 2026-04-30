import { pool } from "../utils/pg"

export const getIsSubscribedChannel = async (channelId: string, meId: string) => {
    try {
        const res = await pool.query(`SELECT * FROM subscriptions WHERE follower_channel_id = $1 AND channel_id = $2`, [meId, channelId])

        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getIsSubscribedChannel repository: ${error}`)
    }
}

export const createSubscribeChannel = async (channelId: string, userId: string) => {
    try {
        const res = await pool.query(`
            DELETE FROM subscriptions 
            WHERE follower_channel_id = $1 AND channel_id = $2
        `,[userId, channelId]
        );
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error createSubscribeChannel repository: ${error}`)
    }
}

export const createSubscription = async (channelId: string, userId: string) => {
    try {
        const res = await pool.query(`
            INSERT INTO subscriptions (follower_channel_id, channel_id, notification_settings) 
            VALUES ($1, $2, true)
        `, [userId, channelId]
        );

        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error createSubscription repository: ${error}`)
    }
}

export const updateSubscriptionNotifSettings = async (channelId: string, userId: string, isNotifSetting: boolean) => {
    try {
        const res = await pool.query(
            `UPDATE subscriptions
             SET notification_settings = $1
             WHERE follower_channel_id = $2 AND channel_id = $3
             RETURNING notification_settings`,
            [isNotifSetting, userId, channelId]
        );

        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateSubscriptionNotifSettings repository: ${error}`)
    }
}