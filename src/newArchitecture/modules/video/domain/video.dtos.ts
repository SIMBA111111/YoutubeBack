import { ChannelEntity } from "../../channel/domain/channel.entity";
import { VideoStatisticEntity } from "../../statistic/domain/statistic.entity";
import { SubscriptionEntity } from "../../subscription/domain/subscription.entity";
import { VideoEntity } from "./video.entity";

export interface IgetVideoByIdServiceDto {
    video: VideoEntity
    videoOwnerChannel: ChannelEntity,
    subscriptionData: SubscriptionEntity | null,
    videoStatData: VideoStatisticEntity | null,
}

export interface IUpdateViewVideoDto {
    success: string
}

export interface IVideoAnalyticDto {
    timeSlot: any
    viewsCount: number
}

export interface IUpdateMarkVideoDto {
    stats: VideoStatisticEntity
    video: VideoEntity
}

export type TSendProgressDto = {
    progress: number,
    stage: string, 
    message: string
}