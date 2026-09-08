import { pool } from "../../shared/utils/pg";
import { AnalyticsDateRange } from "./domain/channel.consts";
import { TAnalyticEntity } from "./domain/channel.dtos";
import { ChannelEntity } from "./domain/channel.entity";
import { IChannelRepository } from "./domain/channel.interface";

export class ChannelRepository implements IChannelRepository {
    async getChannelById(channelId: string): Promise<ChannelEntity> {
        try {
            const res = await pool.query(
                `
                    SELECT ch.* 
                    FROM videos v 
                    JOIN channels ch ON v.channel_id = ch.id
                    WHERE video_hash = $1
                `,
                [channelId]
            );
        
            return ChannelEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error getChannelById repository: ${error}`);
        } 
    }

    async getChannelsByFollowerId(channelId: string, limit: number, offset: number): Promise<ChannelEntity[]> {
        try {
            const res = await pool.query(
                `
                    SELECT c.id, c.name, c.username, c.avatar_url, c.subscribers_count, c.description, subs.notification_settings
                    FROM channels c
                    JOIN subscriptions subs ON subs.channel_id = c.id
                    WHERE subs.follower_channel_id = $1
                    OFFSET $2
                    LIMIT $3
                `,
                [channelId, offset, limit]
            );

            return ChannelEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getChannelsByFollowerId repository: ${error}`);
        }
    }

    async getChannelByUsername(channelUsername: string): Promise<ChannelEntity> {
        try {
            const res = await pool.query(
                `
                    SELECT * 
                    FROM channels
                    WHERE username = $1
                `,
                [channelUsername]
            );
    
        return res.rows[0];
        } catch (error) {
            throw new Error(`Error getChannelsByUsername repository: ${error}`);
        }
    }

    async getChannelViewsCount(channelId: string, dateRange: AnalyticsDateRange): Promise<TAnalyticEntity> {
        try {
            let query = `
                SELECT 
                    TO_CHAR(DATE(vv.viewed_date), 'DD.MM.YYYY') as date,
                    COUNT(vv.id)::INTEGER as views_count
                FROM channels ch
                JOIN videos v ON v.channel_id = ch.id
                JOIN video_views vv ON vv.video_id = v.id
                WHERE ch.id = $1
            `;
            
            const params: any[] = [channelId];
            
            if (dateRange) {
                query += ` AND vv.viewed_date >= NOW() - INTERVAL '${dateRange}'`;
            }
            
            query += ` GROUP BY DATE(vv.viewed_date)
                        ORDER BY DATE(vv.viewed_date) ASC`;
            
            const res = await pool.query(query, params);
            
            // Преобразуем массив в объект
            const result: Record<string, string> = {};
            res.rows.forEach(row => {
                result[row.date] = row.views_count;
            });
            
            console.log('result: ', result); // { '01.01.2026': '110', '02.01.2026': '85' }
            
            return result;
        } catch (error) {
            throw new Error(`Error getChannelViewsCount repository: ${error}`);
        }
    }

    async getChannelViewsCountEvery12Hour(channelId: string, dateRange: AnalyticsDateRange): Promise<TAnalyticEntity> {
        console.log('getChannelViewsCountEvery12Hour');
        
        try {
            const query = `
                SELECT 
                    TO_CHAR(
                        TO_TIMESTAMP(FLOOR(EXTRACT(EPOCH FROM vv.viewed_date) / 43200) * 43200),
                        'DD.MM.YYYY HH24:MI'
                    ) as date,
                    COUNT(vv.id)::INTEGER as views_count
                FROM channels ch
                JOIN videos v ON v.channel_id = ch.id
                JOIN video_views vv ON vv.video_id = v.id
                WHERE ch.id = $1
                    AND vv.viewed_date >= NOW() - INTERVAL '${dateRange}'
                GROUP BY TO_TIMESTAMP(FLOOR(EXTRACT(EPOCH FROM vv.viewed_date) / 43200) * 43200)
                ORDER BY date ASC
            `;
            const res = await pool.query(query, [channelId]);
            const result: Record<string, string> = {};
            res.rows.forEach(row => {
                result[row.date] = row.views_count;
            });
            return result;
        } catch (error) {
            throw new Error(`Error getChannelViewsCountEvery12Hour: ${error}`);
        }
    }

    async getChannelViewsCountEvery2Hour(channelId: string, dateRange: AnalyticsDateRange): Promise<TAnalyticEntity> {
        console.log('getChannelViewsCountEvery2Hour');
    
        try {
            const query = `
                SELECT 
                    TO_CHAR(
                        TO_TIMESTAMP(FLOOR(EXTRACT(EPOCH FROM vv.viewed_date) / 7200) * 7200),
                        'DD.MM.YYYY HH24:MI'
                    ) as date,
                    COUNT(vv.id)::INTEGER as views_count
                FROM channels ch
                JOIN videos v ON v.channel_id = ch.id
                JOIN video_views vv ON vv.video_id = v.id
                WHERE ch.id = $1
                    AND vv.viewed_date >= NOW() - INTERVAL '${dateRange}'
                GROUP BY TO_TIMESTAMP(FLOOR(EXTRACT(EPOCH FROM vv.viewed_date) / 7200) * 7200)
                ORDER BY date ASC
            `;
            const res = await pool.query(query, [channelId]);
            const result: Record<string, string> = {};
            res.rows.forEach(row => {
                result[row.date] = row.views_count;
            });
            return result;
        } catch (error) {
            throw new Error(`Error getChannelViewsCountEvery2Hour: ${error}`);
        }
    }

    async getTotalViewsByDateRange(channelId: string, dateRange: AnalyticsDateRange): Promise<number> {
        try {
            let query = `
                SELECT 
                    COUNT(vv.id)::INTEGER as total_views
                FROM channels ch
                JOIN videos v ON v.channel_id = ch.id
                JOIN video_views vv ON vv.video_id = v.id
                WHERE ch.id = $1
            `;
            
            const params: any[] = [channelId];
            
            if (dateRange) {
                query += ` AND vv.viewed_date >= NOW() - INTERVAL '${dateRange}'`;
            }
            
            const res = await pool.query(query, params);
            
            return res.rows[0]?.total_views || 0;
        } catch (error) {
            throw new Error(`Error getTotalViewsByDateRange repository: ${error}`);
        }
    }

    async updateSubsCountChannel(
        channelId: string,
        operation: "inc" | "decr"
    ): Promise<number> {
        try {
            let res;

            if (operation === "inc") {
            res = await pool.query(
                `
                    UPDATE channels SET subscribers_count = subscribers_count + 1 WHERE id = $1 RETURNING subscribers_count;
                `,
                [channelId]
            );
            } else {
            res = await pool.query(
                `
                    UPDATE channels SET subscribers_count = subscribers_count - 1 WHERE id = $1 RETURNING subscribers_count;
                `,
                [channelId]
            );
            }

            return res.rows[0];
        } catch (error) {
            throw new Error(`Error updateSubsCountChannel repository: ${error}`);
        }
    };

    async updateChannelData(newData: any, paramsIndexes: any, values: any): Promise<ChannelEntity> {
        try {
            const sql = `
                UPDATE channels
                SET ${newData.join(', ')}
                WHERE id = $${paramsIndexes}
                RETURNING *
            `;

            const result = await pool.query(sql, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error updateChannelData repository: ${error}`);
        }
    }
}