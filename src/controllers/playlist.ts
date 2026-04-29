import { Request, Response } from "express";
import { pool } from "../utils/pg";

export const getPlaylistsByChannelUsername = async (req: Request, res: Response) => {
    console.log('getPlaylistsByChannelUsername');
    try {
        const { channelUsername } = req.params;
        const { limit, offset } = req.query;

        const response = await pool.query(`
            SELECT p.* 
            FROM playlists p
            JOIN channels ch ON ch.id = p.channel_id
            WHERE ch.username = $1
            OFFSET $2 LIMIT $3
        `, [channelUsername, offset, limit])

        const result = {
            playlists: response.rows,
            total: response.rows.length,
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getPlaylistsByChannelUsername:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};