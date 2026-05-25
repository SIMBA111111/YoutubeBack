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