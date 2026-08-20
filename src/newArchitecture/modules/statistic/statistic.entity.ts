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