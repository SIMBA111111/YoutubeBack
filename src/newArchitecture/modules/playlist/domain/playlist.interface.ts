import { PlaylistEntity } from "./playlist.entity"

export interface IPlaylistRepopsitory {
    getLikedplaylists: (meId: string, offset: string, limit: string) => Promise<PlaylistEntity[]>
    getPlaylistsByUsername: (channelUsername: string, offset: string, limit: string) => Promise<PlaylistEntity[]>
    createPlaylist: (name: string, userId: string, imagePath: string) => Promise<PlaylistEntity>
}

export interface IPlaylistService {
    createPlaylist: (name: string, userId: string, thumbnail: string) => Promise<PlaylistEntity>
}