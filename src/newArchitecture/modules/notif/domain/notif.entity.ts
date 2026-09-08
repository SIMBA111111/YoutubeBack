export interface INotifEntity {
    id: string;
    viewed: boolean;
    videoId: boolean;
    channelId: string;
    notifTypeId: string;
    createdDate: string;
    updatedDate: string;
}

export class NotifEntity implements INotifEntity {
    id: string;
    viewed: boolean;
    videoId: boolean;
    channelId: string;
    notifTypeId: string;
    createdDate: string;
    updatedDate: string;

    constructor(data: any) {
        this.id = data.id;
        this.viewed = data.viewed;
        this.videoId = data.video_id;
        this.channelId = data.channelId;
        this.notifTypeId = data.notif_type_id;
        this.createdDate = data.createdDate;
        this.updatedDate = data.updatedDate;
    }

    static fromDbRows(dbRows: any[]): NotifEntity[] {
        return dbRows.map(row => new NotifEntity(row));
    }
}