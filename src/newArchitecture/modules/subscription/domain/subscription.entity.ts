export interface ISubscriptionEntity {
    id: string;
    channelId: string;
    followerChannelId: string;
    notificationSettings: boolean;
    createdDate: string;
    updatedDate: string;
    deleted: boolean;
}

export class SubscriptionEntity implements ISubscriptionEntity {
    id: string;
    channelId: string;
    followerChannelId: string;
    notificationSettings: boolean;
    createdDate: string;
    updatedDate: string;
    deleted: boolean;

    constructor(data: any) {
        this.id = data.id;
        this.channelId = data.channel_id;
        this.followerChannelId = data.follower_channel_id;
        this.notificationSettings = data.notification_settings ?? true;
        this.createdDate = data.created_date;
        this.updatedDate = data.updated_date;
        this.deleted = data.deleted ?? false;
    }
}