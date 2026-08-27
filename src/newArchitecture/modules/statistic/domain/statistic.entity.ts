export interface ICommentStatisticEntity {
    id: string
    liked: boolean
    disliked: boolean
    channelId: string
    commentId: string
    createdDate: string
    updatedDate: string
}

export class CommentStatisticEntity implements ICommentStatisticEntity {
    id: string;
    liked: boolean;
    disliked: boolean;
    channelId: string;
    commentId: string;
    createdDate: string;
    updatedDate: string;

    constructor(data: ICommentStatisticEntity) {
        this.id = data.id;
        this.liked = data.liked ?? false;
        this.disliked = data.disliked ?? false;
        this.channelId = data.channelId;
        this.commentId = data.commentId;
        this.createdDate = data.createdDate;
        this.updatedDate = data.updatedDate;
    }
}


export interface IVideoStatisticEntity {
    id: string;
    viewsCount: number;
    liked: boolean;
    disliked: boolean;
    channelId: string;
    videoId: string;
    createdDate: string;
    updatedDate: string;
}

export class VideoStatisticEntity implements IVideoStatisticEntity {
    id: string;
    viewsCount: number;
    liked: boolean;
    disliked: boolean;
    channelId: string;
    videoId: string;
    createdDate: string;
    updatedDate: string;

    constructor(data: any) {
        this.id = data.id;
        this.viewsCount = data.views_count ?? 0;
        this.liked = data.liked ?? false;
        this.disliked = data.disliked ?? false;
        this.channelId = data.channel_id;
        this.videoId = data.video_id;
        this.createdDate = data.created_date;
        this.updatedDate = data.updated_date;
    }
}