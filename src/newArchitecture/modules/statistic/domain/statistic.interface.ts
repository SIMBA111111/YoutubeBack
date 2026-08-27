import { CommentStatisticEntity, VideoStatisticEntity } from "./statistic.entity";

export interface IStatisticRepository {
    getCommentStatisticByUserId: (commentId: string, userId: string) => Promise<CommentStatisticEntity>
    updateCommentStatisticByUserId: (commentId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<CommentStatisticEntity>
    createCommentStatisticByUserId: (commentId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<CommentStatisticEntity>
    getVideoStatisticByFollowerId: (videoId: string, channelId: string) => Promise<VideoStatisticEntity>
    updateVideoStatViewsCount: (videoId: string, viewerId: string) => Promise<VideoStatisticEntity>
    createVideoStatForUser: (videoId: string, userId: string) => Promise<VideoStatisticEntity>
}