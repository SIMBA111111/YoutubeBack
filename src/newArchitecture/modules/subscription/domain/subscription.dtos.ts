export type TAnalyticSubsEntity = Record<string, number>

export type TUpdateSubscriptionNotifSettings = {
   notification_settings: boolean
}

export type TGetAllSubscriptionsByFollowerIdDto = {
   channelId: string
   username: string
}