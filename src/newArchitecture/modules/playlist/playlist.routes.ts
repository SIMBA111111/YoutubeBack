import { Request, Response } from "express";
import express from "express";
import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { PlaylistRepository } from "./playlist.repository";
import { getStringParam } from "../../shared/utils/paramsParse";
import { PlaylistService } from "./playlist.service";

export const router = express.Router();

const playlistRepository = new PlaylistRepository()
const playlistService = new PlaylistService(playlistRepository)


router.get('/playlists/by-username/:channelUsername', async (req: Request, res: Response) => {
    console.log('getPlaylistsByChannelUsername');
    try {
        const { channelUsername } = req.params;
        const { limit, offset } = req.query;

        const response = await playlistRepository.getPlaylistsByUsername(channelUsername as string, offset as string, limit as string)

        const result = {
            playlists: response,
        }

        return res.status(200).json(ApiResponseDTO.success(response))
    } catch (error: any) {
        return res.status(500).json(ApiResponseDTO.error(error));
    }
});


router.post('/playlists/create', async (req: Request, res: Response) => {
    console.log('createPlaylist');
    
    try {
        const name = getStringParam(req.body.name)
        const userId = getStringParam(req.body.userId) 
        const thumbnail = getStringParam(req.body.thumbnail) // thumbnail приходит как base64
        
        if (!name || !userId || !thumbnail) {
            return res.status(500).json(ApiResponseDTO.error('Missing required fields'));
        }

        const createdPlaylist = playlistService.createPlaylist(name, userId, thumbnail)
        
        return res.status(200).json(ApiResponseDTO.success(createdPlaylist))
    } catch (error: any) {
        return res.status(500).json(ApiResponseDTO.error(error));
    }
});