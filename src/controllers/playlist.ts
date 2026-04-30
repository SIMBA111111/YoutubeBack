import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { getPlaylistsByUsername } from "../repositories/playlist";

export const getPlaylistsByChannelUsername = async (req: Request, res: Response) => {
    console.log('getPlaylistsByChannelUsername');
    try {
        const { channelUsername } = req.params;
        const { limit, offset } = req.query;

        const response = await getPlaylistsByUsername(channelUsername as string, offset as string, limit as string)

        const result = {
            playlists: response,
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getPlaylistsByChannelUsername:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};