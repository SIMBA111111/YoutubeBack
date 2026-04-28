import {pool} from '../utils/pg'

export const getChannelsByUser = async (userId: string, offset: number, limit: number) => {
    try {
        const res = await pool.query(`
            SELECT c.id, c.name, c.username, c.avatar_url 
            FROM channels c
            JOIN subscriptions subs ON subs.channel_id = c.id
            WHERE subs.follower_channel_id = $1
            OFFSET $2
            LIMIT $3
        `, [userId, offset, limit])
        
        if (res.rows) 
            return res.rows

        return false
    } catch (error) {
        throw new Error(`Error getChannelsByUser repository: ${error}`)
    }
}