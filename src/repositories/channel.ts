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

export const getChannelsByUsername = async (username: string) => {
    try {
        const res = await pool.query(`
            SELECT * 
            FROM channels
            WHERE username = $1
        `, [username])
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return false
    } catch (error) {
        throw new Error(`Error getChannelsByUsername repository: ${error}`)
    }
}

export const getChannelByVideoHash = async (videoHash: string) => {
    try {
        const res = await pool.query(`
            SELECT ch.* 
            FROM videos v 
            JOIN channels ch ON v.channel_id = ch.id
            WHERE video_hash = $1
        `, [videoHash])       
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getChannelByVideoHash repository: ${error}`)
    }
}