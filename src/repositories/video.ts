import {pool} from '../utils/pg'

export const getTagList = async () => {
    try {
        const res = await pool.query('SELECT * FROM tags')
        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getTagList repository: ${error}`)
    }
}

export const getTagById = async (tagId: string) => {
    try {
        const res = await pool.query('SELECT * FROM tags WHERE id=$1', [tagId])
        if (res.rows[0]) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getTagById repository: ${error}`)
    }
}

export const getVideoList = async () => {
    try {
        const res = await pool.query('SELECT * FROM videos')
        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideoList repository: ${error}`)
    }
}

export const getVideoListBySubs = async (meId: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id   
            JOIN subscriptions s ON s.channel_id = ch.id
            WHERE s.follower_channel_id = $1
            OFFSET $2 LIMIT $3   
        `, [meId, offset, limit])

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideoListBySubs repository: ${error}`)
    }
}

export const getVideoListBySubsIsShorts = async (meId: string, onlyShorts: boolean, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id   
            JOIN subscriptions s ON s.channel_id = ch.id
            WHERE s.follower_channel_id = $1 AND v.is_short=$2
            OFFSET $3 LIMIT $4   
        `, [meId, onlyShorts, offset, limit])

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideoListBySubs repository: ${error}`)
    }
}

export const getVideoListByUsername = async (channelUsername: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT v.* 
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id
            WHERE ch.username = $1 
            OFFSET $2 LIMIT $3
        `, [channelUsername, offset, limit]) 

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideoListByUsername repository: ${error}`)
    }
}

export const getShortVideoListByUsername = async (channelUsername: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT v.* 
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id
            WHERE ch.username = $1 AND v.is_short = true
            OFFSET $2 LIMIT $3
        `, [channelUsername, offset, limit]) 

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getShortVideoListByUsername repository: ${error}`)
    }
}

export const getVideoListByTag = async (tagId: string) => {
    try {
        const res = await pool.query('SELECT * FROM videos WHERE $1 = ANY (tags)', [tagId]);
        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideoListByTag repository: ${error}`)
    }
}


export const getVideoListByNameRepo = async (videoName: string) => {
    try {
        const res = await pool.query(
            'select id, name from videos where name ilike $1',
            [`%${videoName}%`]
        );      

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideoListByName repository: ${error}`)
    }
}


export const getVideoByHashRepo = async (videoHash: string) => {
    try {
        const res = await pool.query('SELECT * FROM videos WHERE video_hash = $1', [videoHash])
        if (res.rows[0]) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getVideoByHash repository: ${error}`)
    }
}

export const getVideoByIdRepo = async (videoId: string) => {
    try {
        const res = await pool.query('select * from videos where id=$1', [videoId])        

        if (res.rows[0]) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getVideoById repository: ${error}`)
    }
}

export const getOrderedVideoList = async (order: 'DESC' | "ASC") => {
    try {
        let res

        if(order === 'DESC') {
            res = await pool.query('SELECT * FROM videos ORDER BY date_publication DESC')
        } else {
            res = await pool.query('SELECT * FROM videos ORDER BY date_publication ASC')
        }

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getOrderedVideoList repository: ${error}`)
    }
}

export const getVideosFollowedChannels = async (channelId: string) => {
    try {

        const res = await pool.query(`
            SELECT v.* 
            FROM videos v
            JOIN subscriptions s ON v.channel_id = s.channel_id
            WHERE s.follower_channel_id = $1
            ORDER BY v.date_publication DESC 
        `, [channelId]);

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getVideosFollowedChannels repository: ${error}`)
    }
}

export const getViewedVideosByChannelId = async (channelId: string) => {
    try {

        const res = await pool.query(`
            SELECT v.* 
            FROM videos v
            JOIN stat_of_videos sov ON v.id = sov.video_id
            WHERE sov.views_count > 0 AND sov.channel_id = $1
        `, [channelId]);

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getViewedVideosByChannelId repository: ${error}`)
    }
}

export const getRecommendedVideosRepo = async (offset: string, limit: string) => {
    try {

        const res = await pool.query('select * from videos OFFSET $1 LIMIT $2', [offset, limit])        

        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getRecommendedVideosRepo repository: ${error}`)
    }
}


export const updateVideoLikes = async (videoId: string, operation: 'inc' | 'decr') => {
    try {
        let res

        if (operation === 'inc') {
            res = await pool.query(`UPDATE videos SET likes_count = likes_count + 1 WHERE id = $1`, [videoId]);
        } else {
            res = await pool.query(`UPDATE videos SET likes_count = likes_count - 1 WHERE id = $1`, [videoId]);
        }

        if (res.rows[0]) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateVideoLikes repository: ${error}`)
    }
}


export const updateVideoDislikes = async (videoId: string, operation: 'inc' | 'decr') => {
    try {
        let res

        if (operation === 'inc') {
            res = await pool.query(`UPDATE videos SET dislikes_count = dislikes_count + 1 WHERE id = $1`, [videoId]);
        } else {
            res = await pool.query(`UPDATE videos SET dislikes_count = dislikes_count - 1 WHERE id = $1`, [videoId]);
        }

        if (res.rows[0]) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateVideoDislikes repository: ${error}`)
    }
}

export const updateVideoViews = async (videoId: string) => {
    try {
        const res = await pool.query(`UPDATE videos SET viewers_count = viewers_count + 1 WHERE id = $1`, [videoId]);

        if (res.rows[0]) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateVideoViews repository: ${error}`)
    }
}