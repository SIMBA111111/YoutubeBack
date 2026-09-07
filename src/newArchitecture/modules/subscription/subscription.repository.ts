import { formatDate } from "../../shared/utils/formatDate";
import { formatDateWithHour } from "../../shared/utils/formatDateWithHour";
import { pool } from "../../shared/utils/pg";
import { AnalyticsDateRange } from "../channel/domain/channel.consts";
import { TAnalyticEntity } from "../channel/domain/channel.dtos";
import { formatDateWithHour12 } from "../channel/domain/channel.utils";
import { TAnalyticSubsEntity, TGetAllSubscriptionsByFollowerIdDto, TUpdateSubscriptionNotifSettings } from "./domain/subscription.dtos";
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

    async getChannelSubsCount(channelId: string, dateRange: AnalyticsDateRange): Promise<TAnalyticSubsEntity> {
          console.log('getChannelSubsCount');
          
          try {
            const query = `
              SELECT 
                DATE(subs.updated_date) as date,
                COUNT(*) FILTER (WHERE subs.deleted = false)::INTEGER - 
                COUNT(*) FILTER (WHERE subs.deleted = true)::INTEGER as count
              FROM channels ch
              JOIN subscriptions subs ON subs.follower_channel_id = ch.id
              WHERE subs.channel_id = $1
                AND subs.updated_date >= NOW() - INTERVAL '${dateRange}'
              GROUP BY DATE(subs.updated_date)
              ORDER BY DATE(subs.updated_date) ASC
            `;
            
            const res = await pool.query(query, [channelId]);
            
            const result: Record<string, number> = {};
            res.rows.forEach(row => {
              const date = new Date(row.date)
              
              const formattedDate = formatDate(date);
              result[formattedDate] = row.count;
            });
            
            return result;
          } catch (error) {
            throw new Error(`Error getChannelSubsCount repository: ${error}`)
          }
    }

    async getChannelSubsCountEvery12Hour(channelId: string, dateRange: AnalyticsDateRange): Promise<TAnalyticSubsEntity> {
        console.log('getChannelSubsCountEvery12Hour');
        
        try {
            const query = `
            SELECT 
                DATE_TRUNC('hour', subs.updated_date) + 
                INTERVAL '12 hours' * FLOOR(EXTRACT(HOUR FROM subs.updated_date) / 12) as date_group,
                COUNT(*)::INTEGER as count
            FROM channels ch
            JOIN subscriptions subs ON subs.follower_channel_id = ch.id
            WHERE subs.channel_id = $1
                AND subs.updated_date >= NOW() - INTERVAL '${dateRange}'
            GROUP BY date_group
            ORDER BY date_group ASC
            `;
            
            const res = await pool.query(query, [channelId]);
            
            const result: Record<string, number> = {};
            res.rows.forEach(row => {
                const date = new Date(row.date_group);
                const formattedDate = formatDateWithHour12(date);
                result[formattedDate] = row.count;
            });
            
            return result;
        } catch (error) {
            throw new Error(`Error getChannelSubsCountEvery12Hour repository: ${error}`)
        }
    }

    async getChannelSubsCountEvery2Hour(channelId: string, dateRange: AnalyticsDateRange): Promise<TAnalyticSubsEntity> {
        console.log('getChannelSubsCountEvery2Hour');
        
        try {
            const query = `
            SELECT 
                DATE_TRUNC('hour', subs.updated_date) + 
                INTERVAL '2 hours' * FLOOR(EXTRACT(HOUR FROM subs.updated_date) / 2) as date_group,
                COUNT(*)::INTEGER as count
            FROM channels ch
            JOIN subscriptions subs ON subs.follower_channel_id = ch.id
            WHERE subs.channel_id = $1
                AND subs.updated_date >= NOW() - INTERVAL '${dateRange}'
            GROUP BY date_group
            ORDER BY date_group ASC
            `;
            
            const res = await pool.query(query, [channelId]);
            
            const result: Record<string, number> = {};
            res.rows.forEach(row => {
            const date = new Date(row.date_group);
            const formattedDate = formatDateWithHour(date);
            result[formattedDate] = row.count;
        });
            
            return result;
        } catch (error) {
            throw new Error(`Error getChannelSubsCountEvery2Hour repository: ${error}`)
        }
    }

    async getTotalSubscriptionByDateRange(channelId: string, dateRange: AnalyticsDateRange): Promise<number> {
        console.log('getTotalSubscriptionByDateRange');
        
        try {
            const query = `
                SELECT 
                COUNT(*) FILTER (WHERE subs.deleted = false)::INTEGER - 
                COUNT(*) FILTER (WHERE subs.deleted = true)::INTEGER as total_subscribers
                FROM channels ch
                JOIN subscriptions subs ON subs.follower_channel_id = ch.id
                WHERE subs.channel_id = $1
                AND subs.updated_date >= NOW() - INTERVAL '${dateRange}'
            `;
            
            const res = await pool.query(query, [channelId]);
            
            return res.rows[0]?.total_subscribers || 0;
        } catch (error) {
            throw new Error(`Error getTotalSubscriptionByDateRange repository: ${error}`);
        }
    }

    async createUnsubscribeChannel(channelId: string, followerId: string): Promise<SubscriptionEntity>  {
        try {
            const res = await pool.query(`
                UPDATE subscriptions
                SET deleted = true, updated_date = now()
                WHERE follower_channel_id = $1 AND channel_id = $2
                RETURNING *;
            `, [followerId, channelId])

            return SubscriptionEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error createSubscribeChannel repository: ${error}`)
        }
    }

    async getSubscription(channelId: string, followerId: string): Promise<SubscriptionEntity> {
        try {
            const res = await pool.query(`
                SELECT * FROM subscriptions
                WHERE follower_channel_id = $1 AND channel_id = $2 
            `, [followerId, channelId]
            );

            return SubscriptionEntity.fromDbRows(res.rows)[0]

        } catch (error) {
            throw new Error(`Error getSubscription repository: ${error}`)
        }
    }

    async createSubscription(channelId: string, followerId: string): Promise<SubscriptionEntity> {
        try {
            const res = await pool.query(`
                INSERT INTO subscriptions (follower_channel_id, channel_id, notification_settings) 
                VALUES ($1, $2, true)
            `, [followerId, channelId]
            );
    
            return SubscriptionEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error createSubscription repository: ${error}`)
        }
    }


    async updateSubscribeChannelRepo(channelId: string, followerId: string): Promise<SubscriptionEntity> {
        try {
            const res = await pool.query(`
                UPDATE subscriptions
                SET deleted = false, updated_date = now()
                WHERE follower_channel_id = $1 AND channel_id = $2
                RETURNING *;
            `, [followerId, channelId]
            );
    
            return SubscriptionEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error updateSubscribeChannelRepo repository: ${error}`)
        }
    }


    async updateSubscriptionNotifSettings(channelId: string, followerId: string, isNotifSetting: boolean): Promise<TUpdateSubscriptionNotifSettings> {
        try {
            const res = await pool.query(
                `UPDATE subscriptions
                 SET notification_settings = $1
                 WHERE follower_channel_id = $2 AND channel_id = $3
                 RETURNING notification_settings`,
                [isNotifSetting, followerId, channelId]
            );
    
            return res.rows[0]
        } catch (error) {
            throw new Error(`Error updateSubscriptionNotifSettings repository: ${error}`)
        }
    }


    async getAllSubscriptionsByFollowerId(followerId: string): Promise<TGetAllSubscriptionsByFollowerIdDto[]> {
        try {
            const res = await pool.query(`
                SELECT ch.id as channelId, ch.username as username
                FROM channels ch
                JOIN subscriptions subs ON subs.follower_channel_id = ch.id
                WHERE subs.channel_id = $1
            `, [followerId]);      

            return res.rows
        } catch (error) {
            throw new Error(`Error getAllSubscriptionsByChannel repository: ${error}`)
        }
    }
}