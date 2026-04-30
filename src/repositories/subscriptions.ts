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