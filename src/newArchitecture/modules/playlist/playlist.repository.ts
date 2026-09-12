import { pool } from "../../shared/utils/pg";
import { PlaylistEntity } from "./domain/playlist.entity";
import { IPlaylistRepopsitory } from "./domain/playlist.interface";

export class PlaylistRepository implements IPlaylistRepopsitory {
    async getLikedplaylists(meId: string, offset: string, limit: string): Promise<PlaylistEntity[]> {
        try {
            const res = await pool.query(`
                SELECT pl.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
                FROM playlists pl
                JOIN stat_of_playlists sop ON sop.playlist_id = pl.id
                JOIN channels ch ON ch.id = pl.channel_id
                WHERE sop.channel_id = $1 AND sop.liked = true
                OFFSET $2 LIMIT $3
            `, [meId, offset, limit])
            
            return PlaylistEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getLikedplaylists repository: ${error}`)
        }
    }

    async getPlaylistsByUsername(channelUsername: string, offset: string, limit: string): Promise<PlaylistEntity[]> {
        console.log('getPlaylistsByUsername');
        
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
}