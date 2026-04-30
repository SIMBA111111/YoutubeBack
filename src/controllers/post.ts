import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { getPostsByUsername } from "../repositories/post";

export const getPostsByChannelUsername = async (req: Request, res: Response) => {
    console.log('getPostsByChannelUsername');
    try {
        const { channelUsername } = req.params;
        const { limit, offset } = req.query;

        const response = await getPostsByUsername(channelUsername as string, offset as string, limit as string)

        const result = {
            posts: response,
            total: response.length,
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getPostsByChannelUsername:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};