export enum notificationSettings {
    All='ALL',
    NOONE='NOONE',
}

export interface ILink {
    id: string
    name: string
    url: string
    linkAvatar: string
}

export interface IChannel {
    id: string
    name: string
    username?: string
    password: string
    avatarUrl?: string
    bannerUrl?: string
    description?: string
    subscribersCount?: number
    videosCount?: number
    viewersCount?: number
    country?: string
    createdAt?: string
    links: ILink[]
    notificationSetting?: notificationSettings
}