export interface IPlaylistEntity {
    id: string;
    name: boolean;
    thumbnailUrl: boolean;
    channelId: string;
    videoCount: string;
    createdDate: string;
    updatedDate: string;
}

export class PlaylistEntity implements IPlaylistEntity {
    id: string;
    name: boolean;
    thumbnailUrl: boolean;
    channelId: string;
    videoCount: string;
    createdDate: string;
    updatedDate: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.thumbnailUrl = data.thumbnail_url;
        this.channelId = data.channel_id;
        this.videoCount = data.video_count;
        this.createdDate = data.createdDate;
        this.updatedDate = data.updatedDate;
    }

    static fromDbRows(dbRows: any[]): PlaylistEntity[] {
        return dbRows.map(row => new PlaylistEntity(row));
    }
}