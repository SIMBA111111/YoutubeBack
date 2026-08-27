import { SubscriptionEntity } from "./subscription.entity";

export interface ISubscriptionRepository {
    getSubscriptionDataByFollowerId: (followerId: string, channelId: string) => Promise<SubscriptionEntity>;
}