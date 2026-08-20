import { ITag } from "./mapTag"

interface IPlaylist {
    id: string
    playlistPreview: string
    playlistName: string
    channelId: string
    createdAt: string
    updatedAt: string
    videoCount: number
}

const mapToIPlaylist = (playlist: any): IPlaylist => {
    return {
        id: playlist.id,
        playlistName: playlist.name,
        playlistPreview: playlist.thumbnail_url,
        videoCount: playlist.video_count,
        createdAt: playlist.created_date,
        updatedAt: playlist.updated_date,
        channelId: playlist.channel_id
    };
};

export const mapPlaylistsToIPlaylists= (playlists: any[]): IPlaylist[] => {
    return playlists.map(playlist => mapToIPlaylist(playlist));
};