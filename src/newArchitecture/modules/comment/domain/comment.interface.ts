import { ICommentStatisticEntity } from "../../statistic/domain/statistic.entity";
import { TCommentActions, TCommentFilters } from "./comment.consts";
import { IGetCommentFullInfoDto } from "./comment.dtos";
import { CommentEntity, ICommentEntity } from "./comment.entity";

export interface ICommentRepository {
    getRepliesComment: (parentCommentId: string, userId: string, offset: number, limit: number) => Promise<ICommentEntity[]>
    getRepliesCommentCount: (parentCommentId: string) => Promise<number>
    getCommentsByVideoId: (videoId: string, userId: string, filter: TCommentFilters, offset: number, limit: number) => Promise<IGetCommentFullInfoDto[]>
    getVideoCommentsCount: (videoId: string) => Promise<number>
    createComment: (commentText: string, videoId: string, userId: string) => Promise<CommentEntity | null>
    deleteComment: (commentId: string) => Promise<boolean>
    updateCommentLikeCount: (commentId: string, action: TCommentActions) => Promise<CommentEntity>
    updateCommentDislikeCount: (commentId: string, action: TCommentActions) => Promise<CommentEntity>
    createReplyComment: (commentText: string, videoId: string, userId: string, parentCommentId: string) => Promise<CommentEntity>
}



// TO DO это в дто переместить ?
export interface IGetRepliesCommentResponse {
    comments: ICommentEntity[]
    commentsCount: number
}

export interface IGetCommentResponse {
    comments: IGetCommentFullInfoDto[]
    commentsCount: number
}


export interface IMarkCommentResponse {
    updatedComment: ICommentEntity
    updatedStatistic: ICommentStatisticEntity
}

export interface ICommentService {
    getRepliesComment: (parentCommentId: string, userId: string, offset: number, limit: number) => Promise<IGetRepliesCommentResponse>
    getComments: (videoId: string, userId: string, filter: TCommentFilters, offset: number, limit: number) => Promise<IGetCommentResponse | string>
    createComment: (commentText: string, videoId: string, userId: string) => Promise<CommentEntity | null>
    markComment: (commentId: string, userId: string, isLiked: boolean | null, isDisliked: boolean | null) => Promise<IMarkCommentResponse | null>
}
