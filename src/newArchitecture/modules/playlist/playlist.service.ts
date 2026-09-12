import { PlaylistEntity } from "./domain/playlist.entity";
import { IPlaylistRepopsitory, IPlaylistService } from "./domain/playlist.interface";

export class PlaylistService implements IPlaylistService {
    constructor(private playlistRepository: IPlaylistRepopsitory) {}

    createPlaylist: () => Promise<PlaylistService>
}