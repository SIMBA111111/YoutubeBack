import { VideoEntity } from "../../video/domain/video.entity";
import { AnalyticsDateRange, TTab } from "./channel.consts";
import { IGetChannelAnalyticServiceDto, IGetChannelInfoServiceDto, TAnalyticEntity, TSubscribeChannel } from "./channel.dtos";
import { ChannelEntity } from "./channel.entity";

export interface IChannelRepository {
    getChannelById: (channelId: string) => Promise<ChannelEntity>
    getChannelByUsername: (channelUsername: string) => Promise<ChannelEntity>
    getChannelsByFollowerId: (channelId: string, limit: number, offset: number) => Promise<ChannelEntity[]>
    getChannelViewsCountEvery2Hour: (channelId: string, dateRange: AnalyticsDateRange) => Promise<TAnalyticEntity>
    getChannelViewsCountEvery12Hour: (channelId: string, dateRange: AnalyticsDateRange) => Promise<TAnalyticEntity>
    getChannelViewsCount: (channelId: string, dateRange: AnalyticsDateRange) => Promise<TAnalyticEntity>
    getTotalViewsByDateRange: (channelId: string, dateRange: AnalyticsDateRange) => Promise<number>
    updateSubsCountChannel(channelId: string, operation: "inc" | "decr"): Promise<number>
    updateChannelData(newData: any, paramsIndexes: any, values: any): Promise<ChannelEntity>
}

export interface IChannelServicve {
    getChannelInfo: (channelUsername: string, followerId: string) => Promise<IGetChannelInfoServiceDto>
    getChannelAnalyticService: (channelId: string, dateRange: AnalyticsDateRange, tab: TTab) => Promise<IGetChannelAnalyticServiceDto>
    subscribeChannel: (channelId: string, userId: string, isSubscribed: boolean) => Promise<TSubscribeChannel>
    updateChannelData: (channelId: string, channelData: any) => Promise<ChannelEntity>
}