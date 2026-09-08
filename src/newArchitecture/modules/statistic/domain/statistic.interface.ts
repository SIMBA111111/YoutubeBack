import { IStatisticVideoDto } from "./statistic.dtos";
import { CommentStatisticEntity, VideoStatisticEntity } from "./statistic.entity";

export interface IStatisticRepository {
    getCommentStatisticByUserId: (commentId: string, userId: string) => Promise<CommentStatisticEntity>
    updateCommentStatisticByUserId: (commentId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<CommentStatisticEntity>
    createCommentStatisticByUserId: (commentId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<CommentStatisticEntity>
    getVideoStatByUser: (videoId: string, userId: string) => Promise<VideoStatisticEntity>
    getVideoStatisticByFollowerId: (videoId: string, channelId: string) => Promise<VideoStatisticEntity>
    updateVideoStatViewsCount: (videoId: string, viewerId: string) => Promise<VideoStatisticEntity>
    createVideoStatForUser: (videoId: string, userId: string, isDisliked: boolean, isLiked: boolean, firstView?: boolean) => Promise<VideoStatisticEntity>
    getVideoViewsLast24Hours: (videoId: string) => Promise<IStatisticVideoDto>
    getVideoViewsLast3Days: (videoId: string) => Promise<IStatisticVideoDto>
    getVideoAnalyticsRepo: (videoId: string, dateRange: string) => Promise<IStatisticVideoDto>
    updateVideoStatUser: (videoId: string, userId: string, isDisliked: boolean, isLiked: boolean) => Promise<VideoStatisticEntity>
}