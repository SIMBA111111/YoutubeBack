import { AnalyticsDateRange } from "../../channel/domain/channel.consts";
import { TAnalyticSubsEntity, TGetAllSubscriptionsByFollowerIdDto, TUpdateSubscriptionNotifSettings } from "./subscription.dtos";
import { SubscriptionEntity } from "./subscription.entity";

export interface ISubscriptionRepository {
    getSubscriptionDataByFollowerId: (followerId: string, channelId: string) => Promise<SubscriptionEntity>;
    getChannelSubsCountEvery2Hour: (channelId: string, dateRange: AnalyticsDateRange) => Promise<TAnalyticSubsEntity>
    getChannelSubsCountEvery12Hour: (channelId: string, dateRange: AnalyticsDateRange) => Promise<TAnalyticSubsEntity>
    getChannelSubsCount: (channelId: string, dateRange: AnalyticsDateRange) => Promise<TAnalyticSubsEntity>
    getTotalSubscriptionByDateRange: (channelId: string, dateRange: AnalyticsDateRange) => Promise<number>
    createUnsubscribeChannel(channelId: string, followerId: string): Promise<SubscriptionEntity>
    getSubscription(channelId: string, followerId: string): Promise<SubscriptionEntity>
    updateSubscriptionNotifSettings(channelId: string, followerId: string, isNotifSetting: boolean): Promise<TUpdateSubscriptionNotifSettings>
    updateSubscribeChannelRepo(channelId: string, followerId: string): Promise<SubscriptionEntity>
    createSubscription(channelId: string, followerId: string): Promise<SubscriptionEntity>
    getAllSubscriptionsByFollowerId(followerId: string): Promise<TGetAllSubscriptionsByFollowerIdDto[]>
}