import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { getPlaylistsByUsername, createPlaylistRepo } from "../repositories/playlist";
import path from "path";
import fs from 'fs';


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

export const createPlaylist = async (req: Request, res: Response) => {
    console.log('createPlaylist');
    
    try {
        const { name, userId, thumbnail } = req.body; // thumbnail приходит как base64
        
        console.log('name:', name);
        console.log('userId:', userId);
        
        if (!name || !userId || !thumbnail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Декодируем base64 в буфер
        const base64Data = thumbnail.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Сохраняем файл
        const filename = `playlist-${Date.now()}.png`;
        const filepath = path.join(__dirname, '../../uploads/playlists', filename);
        
        fs.writeFileSync(filepath, buffer);
        
        const imagePath = `/uploads/playlists/${filename}`;
        
        // Сохраняем в БД
        const response = await createPlaylistRepo(name, userId, imagePath);
        
        const result = {
            playlist: response,
        };
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error createPlaylist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};