export interface IChannelEntity {
    id: string;
    name: string;
    username: string;
    password: string;
    email: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    subscribersCount: number;
    videosCount: number;
    viewersCount: number;
    country: string | null;
    createdAt: string;
    links: string[] | null;
    notificationSetting: string[] | null;
}

export class ChannelEntity implements IChannelEntity {
    id: string;
    name: string;
    username: string;
    password: string;
    email: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    subscribersCount: number;
    videosCount: number;
    viewersCount: number;
    country: string | null;
    createdAt: string;
    links: string[] | null;
    notificationSetting: string[] | null;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.avatarUrl = data.avatar_url ?? null;
        this.bannerUrl = data.banner_url ?? null;
        this.description = data.description ?? null;
        this.subscribersCount = data.subscribers_count ?? 0;
        this.videosCount = data.videos_count ?? 0;
        this.viewersCount = data.viewers_count ?? 0;
        this.country = data.country ?? null;
        this.createdAt = data.created_at;
        this.links = data.links ?? null;
        this.notificationSetting = data.notification_setting ?? null;
    }
}