import { pool } from "../utils/pg"

export const getPostsByUsername = async (channelUsername: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT p.* 
            FROM posts p
            JOIN channels ch ON ch.id = p.channel_id
            WHERE ch.username = $1
            OFFSET $2 LIMIT $3
        `, [channelUsername, offset, limit])
        
        if (res.rows.length > 0) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getPostsByUsername repository: ${error}`)
    }
}