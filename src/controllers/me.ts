import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { mapVideosToIVideo } from "../utils/maps/mapVideo";
import { mapPlaylistsToIPlaylists } from "../utils/maps/mapPlaylist";


export const getMeInfo = async (req: Request, res: Response) => {
    console.log('getMeInfo');
    try {
        const { meId } = req.params;

        const response = await pool.query(`
            SELECT * 
            FROM channels
            WHERE id = $1
        `, [meId])

        const result = {
            meInfo: response.rows[0],
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getMeInfo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getMyLikedVideoList = async (req: Request, res: Response) => {
    console.log('getMyLikedVideoList');
    try {
        const { meId } = req.params;
        const { offset, limit } = req.query;

        const response = await pool.query(`
            SELECT v.* 
            FROM videos v
            JOIN stat_of_videos sov ON sov.video_id = v.id 
            WHERE sov.channel_id = $1 AND sov.liked = true
            OFFSET $2 LIMIT $3
        `, [meId, offset, limit])

        const result = {
            likedVideos: mapVideosToIVideo(response.rows),
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getMyLikedVideoList:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getMyLikedPlaylists = async (req: Request, res: Response) => {
    console.log('getMyLikedPlaylists');
    try {
        const { meId } = req.params;
        const { offset, limit } = req.query;

        const response = await pool.query(`
            SELECT pl.* 
            FROM playlists pl
            JOIN stat_of_playlists sop ON sop.playlist_id = pl.id
            WHERE sop.channel_id = $1 AND sop.liked = true
            OFFSET $2 LIMIT $3
        `, [meId, offset, limit])

        const result = {
            likedPlaylists: mapPlaylistsToIPlaylists(response.rows),
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getMyLikedPlaylists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getMyViewsHistory = async (req: Request, res: Response) => {
    console.log('getMyViewsHistory');
    try {
        const { meId } = req.params;
        const { offset, limit } = req.query;

        const response = await pool.query(`
            SELECT v.*, ch.id as channelId, ch.username as channelUsername, ch.avatar_url as channelAvatarUrl
            FROM videos v
            JOIN stat_of_videos sov ON sov.video_id = v.id
            JOIN channels ch ON ch.id = v.channel_id
            WHERE sov.channel_id = $1
            ORDER BY sov.updated_date DESC
            OFFSET $2 LIMIT $3
        `, [meId, offset, limit])

        const result = {
            viewsHistory: mapVideosToIVideo(response.rows),
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getMyViewsHistory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};