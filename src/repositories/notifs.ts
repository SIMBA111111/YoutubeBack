import { pool } from "../utils/pg"

export const getNotifsByUserId = async (userId: string) => {
    try {
        const res = await pool.query(`
            SELECT n.*, nt.name as notif_name, v.name as video_name, v.video_hash, v.is_short, v.thumbnail_url, ch.name as channel_name, ch.avatar_url  
            FROM notifications n
            JOIN channels ch ON ch.id = n.channel_id
            JOIN videos v ON v.id = n.video_id
            JOIN notif_types nt ON nt.id = n.notif_type_id
            JOIN subscriptions s ON s.channel_id = ch.id
            WHERE s.follower_channel_id = $1
        `, [userId])
        
        if (res.rows.length > 0) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getNotifsByUserId repository: ${error}`)
    }
}


export const createNewVideoNotifs = async (videoId: string, consumerIds: string[]) => {
    console.log('createNewVideoNotifs');
    console.log('videoId', videoId);
    console.log('consumerIds', consumerIds);
    
    try {
        if (!consumerIds || consumerIds.length === 0) {
            return null
        }

        const res = await pool.query(`
            INSERT INTO notifications (video_id, channel_id, notif_type_id)
            SELECT $1, unnest($2::uuid[]), $3
            RETURNING *
        `, [videoId, consumerIds, 'e9c16295-bae4-4ea5-ac31-b5c12f178a2b'])
        
        if (res.rows.length > 0) {
            return res.rows
        }

        return null
    } catch (error) {
        throw new Error(`Error createNewVideoNotifs repository: ${error}`)
    }
}