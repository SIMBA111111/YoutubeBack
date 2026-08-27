import { pool } from "../../shared/utils/pg";
import { SubscriptionEntity } from "./domain/subscription.entity";
import { ISubscriptionRepository } from "./domain/subscription.interface";

export class SubscriptionRepository implements ISubscriptionRepository {
    async getSubscriptionDataByFollowerId(followerId: string, channelId: string): Promise<SubscriptionEntity> {
        try {
            const res = await pool.query(`
                SELECT * FROM subscriptions WHERE follower_channel_id = $1 AND channel_id = $2 AND deleted = false
            `, [followerId, channelId])
    
            return res.rows[0]
        } catch (error) {
            throw new Error(`Error getIsSubscribedChannel repository: ${error}`)
        }
    }
}