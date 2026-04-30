import { pool } from "../utils/pg"

export const getStatOfVideoForUser = async (videoId: string, userId: string) => {
    try {
        const res = await pool.query(`SELECT * FROM stat_of_videos WHERE video_id = $1 AND channel_id = $2`, [videoId, userId])
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error getStatOfVideoForUser repository: ${error}`)
    }
}

export const updateStatOfVideoForUser = async (videoId: string, userId: string, isDisliked: boolean, isLiked: boolean) => {
    try {
        const res = await pool.query(
            `UPDATE stat_of_videos 
                SET liked = $1, disliked = $2 
                WHERE channel_id = $3 AND video_id = $4`,
            [isLiked, isDisliked, userId, videoId]
        );
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateStatOfVideoForUser repository: ${error}`)
    }
}


export const createStatOfVideoForUser = async (videoId: string, userId: string, isDisliked: boolean, isLiked: boolean, firstView: boolean = false) => {
    try {
        let res 

        if(firstView) {
            res = await pool.query('INSERT INTO stat_of_videos (channel_id, video_id, views_count) VALUES ($1, $2, 1)', [userId, videoId]);  

        } else {
            res = await pool.query(`
                INSERT INTO stat_of_videos (channel_id, video_id, liked, disliked) 
                VALUES ($1, $2, $3, $4)
            `, [userId, videoId, isLiked, isDisliked]
            );
        }
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error createStatOfVideoForUser repository: ${error}`)
    }
}


export const updateStatOfVideoViewsCount = async (videoId: string, userId: string) => {
    try {
        const res = await pool.query('UPDATE stat_of_videos SET views_count = views_count + 1, updated_date = now() WHERE channel_id = $1 AND video_id = $2', [userId, videoId]);      
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateStatOfVideoViewsCount repository: ${error}`)
    }
}
