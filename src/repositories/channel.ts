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

        return []
    } catch (error) {
        throw new Error(`Error getChannelsByUser repository: ${error}`)
    }
}


export const getChannelById = async (channelId: string) => {
    try {
        const res = await pool.query(`
            SELECT * 
            FROM channels
            WHERE id = $1
        `, [channelId])
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getChannelById repository: ${error}`)
    }
}


export const getChannelByUsername = async (username: string) => {
    try {
        const res = await pool.query(`
            SELECT * 
            FROM channels
            WHERE username = $1
        `, [username])
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
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

export const updateSubsCountChannel = async (channelId: string, operation: "inc" | "decr") => {
    try {
        let res

        if(operation === 'inc') {
            res = await pool.query(`
                UPDATE channels SET subscribers_count = subscribers_count + 1 WHERE id = $1
            `, [channelId]);      

        } else {
            res = await pool.query(`
                UPDATE channels SET subscribers_count = subscribers_count - 1 WHERE id = $1
            `, [channelId])
        }

        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateSubsCountChannel repository: ${error}`)
    }
}


export const getLikedVideos = async (meId: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT v.* 
            FROM videos v
            JOIN stat_of_videos sov ON sov.video_id = v.id 
            WHERE sov.channel_id = $1 AND sov.liked = true
            OFFSET $2 LIMIT $3
        `, [meId, offset, limit])
        
        if (res.rows.length > 0) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getLikedVideos repository: ${error}`)
    }
}


export const getChannelHistory = async (meId: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT v.*, ch.id as channelId, ch.username as channelUsername, ch.avatar_url as channelAvatarUrl
            FROM videos v
            JOIN stat_of_videos sov ON sov.video_id = v.id
            JOIN channels ch ON ch.id = v.channel_id
            WHERE sov.channel_id = $1
            ORDER BY sov.updated_date DESC
            OFFSET $2 LIMIT $3
        `, [meId, offset, limit])
        
        if (res.rows.length > 0) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getChannelHistory repository: ${error}`)
    }
}