import { pool } from "../utils/pg"

export const getLikedplaylists = async (meId: string, offset: string, limit: string) => {
    try {
        const res = await pool.query(`
            SELECT pl.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
            FROM playlists pl
            JOIN stat_of_playlists sop ON sop.playlist_id = pl.id
            JOIN channels ch ON ch.id = pl.channel_id
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
    console.log('getPlaylistsByUsername');
    
    console.log('channelUsername = ', channelUsername);
    console.log('offset = ', offset);
    console.log('limit = ', limit);
    

    try {
        const res = await pool.query(`
            SELECT p.* 
            FROM playlists p
            JOIN channels ch ON ch.id = p.channel_id
            WHERE ch.username = $1
            OFFSET $2 LIMIT $3
        `, [channelUsername, offset, limit])

        console.log('res.rows = ', res.rows);
        

        if (res.rows.length > 0) 
            
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getPlaylistsByUsername repository: ${error}`)
    }
}

export const createPlaylistRepo = async (name: string, userId: string, thumbnailUrl: string) => {
    try {
        const res = await pool.query(`
            INSERT INTO playlists (name, channel_id, thumbnail_url) VALUES ($1, $2, $3) RETURNING *
        `, [name, userId, thumbnailUrl])
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return []
    } catch (error) {
        throw new Error(`Error createPlaylistRepo repository: ${error}`)
    }
}
