import { SubscriptionEntity } from "../../subscription/domain/subscription.entity";
import { ChannelEntity } from "./channel.entity";

export interface IGetChannelInfoServiceDto {
    channelData: ChannelEntity
    subscriptionData: SubscriptionEntity | null
}

export interface IGetChannelAnalyticServiceDto {
    analyticData: any, 
    totalViews: number, 
    totalSubscriptions: number
}

export type TAnalyticEntity = Record<string, string>

export type TSubscribeChannel = {
    isSubscribed: boolean
}

export type TUpdateSaveHistoryByChannelDto = {
    id: string
    isSaveHistory: boolean
}