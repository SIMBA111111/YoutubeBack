import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { mapVideosToIVideo } from "../utils/maps/mapVideo";
import { mapPlaylistsToIPlaylists } from "../utils/maps/mapPlaylist";
import { getChannelById, getChannelHistory, getLikedVideos } from "../repositories/channel";
import { getLikedplaylists } from "../repositories/playlist";


export const getMeInfo = async (req: Request, res: Response) => {
    console.log('getMeInfo');
    try {
        const { meId } = req.params;

        const response = await getChannelById(meId as string)

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

        const response = await getLikedVideos(meId as string, offset as string, limit as string)

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

        const response = await getLikedplaylists(meId as string, offset as string, limit as string)

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

        const response = await getChannelHistory(meId as string, offset as string, limit as string)

        const result = {
            viewsHistory: mapVideosToIVideo(response.rows),
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getMyViewsHistory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};