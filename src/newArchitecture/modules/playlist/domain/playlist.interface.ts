import { PlaylistEntity } from "./playlist.entity"

export interface IPlaylistRepopsitory {
    getLikedplaylists: (meId: string, offset: string, limit: string) => Promise<PlaylistEntity[]>
    getPlaylistsByUsername: (channelUsername: string, offset: string, limit: string) => Promise<PlaylistEntity[]>
}

export interface IPlaylistService {
}