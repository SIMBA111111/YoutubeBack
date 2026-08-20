import { CommentStatisticEntity } from "./statistic.entity";

export interface IStatisticRepository {
    getCommentStatisticByUserId: (commentId: string, userId: string) => Promise<CommentStatisticEntity>
    updateCommentStatisticByUserId: (commentId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<CommentStatisticEntity>
    createCommentStatisticByUserId: (commentId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<CommentStatisticEntity>
}