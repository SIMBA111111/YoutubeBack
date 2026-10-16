import fs from 'fs';
import path from "path";
import { PlaylistEntity } from "./domain/playlist.entity";
import { IPlaylistRepopsitory, IPlaylistService } from "./domain/playlist.interface";

export class PlaylistService implements IPlaylistService {
    constructor(private playlistRepository: IPlaylistRepopsitory) {}

    async createPlaylist(name: string, userId: string, thumbnail: string): Promise<PlaylistEntity> {
        // Декодируем base64 в буфер
        const base64Data = thumbnail.split(';base64,').pop();

        if (!base64Data) {
            throw new Error('Invalid thumbnail format');
        }

        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `playlist-${Date.now()}.png`;
        const filepath = path.join(__dirname, '../../uploads/playlists', filename);
        
        fs.writeFileSync(filepath, buffer);
        
        const imagePath = `/uploads/playlists/${filename}`;
        
        const response = await this.playlistRepository.createPlaylist(name, userId, imagePath);
        return response
    }
}