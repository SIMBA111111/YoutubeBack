import { pool } from "../utils/pg"

export const getLikedplaylists = async (meId: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT pl.* 
            FROM playlists pl
            JOIN stat_of_playlists sop ON sop.playlist_id = pl.id
            WHERE sop.channel_id = $1 AND sop.liked = true
            OFFSET $2 LIMIT $3
        `, [meId, offset, limit])
        
        if (res.rows.length > 0) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getLikedplaylists repository: ${error}`)
    }
}

export const getPlaylistsByUsername = async (channelUsername: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT p.* 
            FROM playlists p
            JOIN channels ch ON ch.id = p.channel_id
            WHERE ch.username = $1
            OFFSET $2 LIMIT $3
        `, [channelUsername, offset, limit])
        
        if (res.rows.length > 0) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getPlaylistsByUsername repository: ${error}`)
    }
}