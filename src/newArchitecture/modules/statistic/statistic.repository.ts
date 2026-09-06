import { pool } from "../../shared/utils/pg";
import { IStatisticVideoDto } from "./domain/statistic.dtos";
import { CommentStatisticEntity, IVideoStatisticEntity, VideoStatisticEntity } from "./domain/statistic.entity";
import { IStatisticRepository } from "./domain/statistic.interface";

export class StatisticRepository implements IStatisticRepository {
    async getCommentStatisticByUserId(commentId: string, userId: string): Promise<CommentStatisticEntity> {
        const commentStatistic = await pool.query(
            `SELECT * FROM stat_of_comments WHERE channel_id = $1 AND comment_id = $2`,
            [userId, commentId]
        );

        return new CommentStatisticEntity({
            id: commentStatistic.rows[0].id,
            channelId: commentStatistic.rows[0].channel_id,
            commentId: commentStatistic.rows[0].comment_id,
            createdDate: commentStatistic.rows[0].created_date,
            disliked: commentStatistic.rows[0].disliked,
            liked: commentStatistic.rows[0].liked,
            updatedDate: commentStatistic.rows[0].updated_date,
        })
    }

    
    async createCommentStatisticByUserId(commentId: string, userId: string, isLiked: boolean, isDisliked: boolean): Promise<CommentStatisticEntity> {
        const createdCommentStatistic = await pool.query(
        `
            INSERT INTO stat_of_comments (channel_id, comment_id, liked, disliked) 
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
        [userId, commentId, isLiked, isDisliked]
        );
        
        return new CommentStatisticEntity({
            id: createdCommentStatistic.rows[0].id,
            channelId: createdCommentStatistic.rows[0].channel_id,
            commentId: createdCommentStatistic.rows[0].comment_id,
            createdDate: createdCommentStatistic.rows[0].created_date,
            disliked: createdCommentStatistic.rows[0].disliked,
            liked: createdCommentStatistic.rows[0].liked,
            updatedDate: createdCommentStatistic.rows[0].updated_date,
        })
    }


    async updateCommentStatisticByUserId(commentId: string, userId: string, isLiked: boolean, isDisliked: boolean): Promise<CommentStatisticEntity> {
        const updatedCommentStatistic = await pool.query(
            `
                UPDATE stat_of_comments 
                SET liked = $1, disliked = $2 
                WHERE channel_id = $3 AND comment_id = $4
                RETURNING *
            `,
            [isLiked, isDisliked, userId, commentId]
        );

        return new CommentStatisticEntity({
            id: updatedCommentStatistic.rows[0].id,
            channelId: updatedCommentStatistic.rows[0].channel_id,
            commentId: updatedCommentStatistic.rows[0].comment_id,
            createdDate: updatedCommentStatistic.rows[0].created_date,
            disliked: updatedCommentStatistic.rows[0].disliked,
            liked: updatedCommentStatistic.rows[0].liked,
            updatedDate: updatedCommentStatistic.rows[0].updated_date,
        })
    }


    async getVideoStatisticByFollowerId(videoId: string, channelId: string): Promise<VideoStatisticEntity> {
            try {
                const res = await pool.query(`
                    SELECT * FROM subscriptions WHERE follower_channel_id = $1 AND channel_id = $2 AND deleted = false
                `, [channelId, channelId])
        
                return res.rows[0]
        
            } catch (error) {
                throw new Error(`Error getVideoStatisticByFollowerId repository: ${error}`)
            }
    }

    
    async updateVideoStatViewsCount(videoId: string, viewerId: string): Promise<VideoStatisticEntity> {
        try {
            const res = await pool.query('UPDATE stat_of_videos SET views_count = views_count + 1, updated_date = now() WHERE channel_id = $1 AND video_id = $2', [viewerId, videoId]);      
            
            return res.rows[0]
        } catch (error) {
            throw new Error(`Error updateStatOfVideoViewsCount repository: ${error}`)
        }
    }

    
    async createStatOfVideoForUser(videoId: string, userId: string, isDisliked: boolean, isLiked: boolean, firstView: boolean = false): Promise<VideoStatisticEntity> {
        try {
            let res 

            if(firstView) {
                res = await pool.query('INSERT INTO stat_of_videos (channel_id, video_id, views_count) VALUES ($1, $2, 1)', [userId, videoId]);  

            } else {
                res = await pool.query(`
                    INSERT INTO stat_of_videos (channel_id, video_id, liked, disliked, views_count) 
                    VALUES ($1, $2, $3, $4, 1)
                `, [userId, videoId, isLiked, isDisliked]
                );
            }
            
            return VideoStatisticEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error createStatOfVideoForUser repository: ${error}`)
        }
    }


    async getVideoAnalyticsRepo(videoId: string, dateRange: string): Promise<IStatisticVideoDto> {
        try {
            let query = `
                SELECT 
                    TO_CHAR(DATE(vv.viewed_date), 'DD.MM.YYYY') as date,
                    COUNT(vv.id)::INTEGER as views_count
                FROM video_views vv
                WHERE vv.video_id = $1
            `;
            
            const params: any[] = [videoId];
            
            if (dateRange) {
                query += ` AND vv.viewed_date >= NOW() - INTERVAL '${dateRange}'`;
            }
            
            query += ` GROUP BY DATE(vv.viewed_date) ORDER BY DATE(vv.viewed_date) ASC`;
            
            const res = await pool.query(query, params);

            console.log('res.rows: ', res.rows);
            
            const result: Record<string, number> = {};
           
            res.rows.forEach(row => {
                result[row.date] = row.views_count;
            });
            
            return result;
        } catch (error) {
            throw new Error(`Error getVideoAnalyticsRepo repository: ${error}`);
        }
    }

    async getVideoViewsLast24Hours(videoId: string): Promise<IStatisticVideoDto> {
        try {
            const query = `
            SELECT 
                TO_CHAR(
                DATE_TRUNC('hour', vv.viewed_date) - 
                INTERVAL '2 hours' * (EXTRACT(HOUR FROM vv.viewed_date)::INTEGER % 2) +
                INTERVAL '2 hours' * (EXTRACT(HOUR FROM vv.viewed_date)::INTEGER % 2),
                'YYYY-MM-DD HH24:00'
                ) as time_slot,
                COUNT(vv.id)::INTEGER as views_count
            FROM video_views vv
            WHERE vv.video_id = $1
                AND vv.viewed_date >= NOW() - INTERVAL '24 hours'
            GROUP BY time_slot
            ORDER BY time_slot ASC
            `;
            
            const res = await pool.query(query, [videoId]);
            
            // Возвращаем объект { '2026-07-12 10:00': 45, '2026-07-12 12:00': 32, ... }
            return res.rows.reduce((acc, row) => {
            acc[row.time_slot] = row.views_count;
            return acc;
            }, {} as Record<string, number>);
        } catch (error) {
            throw new Error(`Error getVideoViewsLast24Hours repository: ${error}`);
        }
    }

    async getVideoViewsLast3Days(videoId: string): Promise<IStatisticVideoDto> {
        try {
            const query = `
            WITH time_slots AS (
                SELECT generate_series(
                DATE_TRUNC('day', NOW()) - INTERVAL '2 days',
                DATE_TRUNC('day', NOW()) + INTERVAL '1 day',
                INTERVAL '12 hours'
                ) as slot_start
            ),
            views_agg AS (
                SELECT 
                DATE_TRUNC('day', vv.viewed_date) + 
                INTERVAL '12 hours' * FLOOR(EXTRACT(HOUR FROM vv.viewed_date) / 12) as slot,
                COUNT(*)::INTEGER as views_count
                FROM video_views vv
                WHERE vv.video_id = $1
                AND vv.viewed_date >= NOW() - INTERVAL '3 days'
                GROUP BY slot
            )
            SELECT 
                TO_CHAR(ts.slot_start, 'YYYY-MM-DD HH24:00') as time_slot,
                COALESCE(va.views_count, 0) as views_count
            FROM time_slots ts
            LEFT JOIN views_agg va ON va.slot = ts.slot_start
            ORDER BY ts.slot_start ASC
            `;
            
            const res = await pool.query(query, [videoId]);
            
            return res.rows.reduce((acc, row) => {
                acc[row.time_slot] = row.views_count
                return acc
            }, {} as Record<string, number>)

        } catch (error) {
            throw new Error(`Error getVideoViewsLast3Days repository: ${error}`);
        }
    }

    async getVideoStatByUser(videoId: string, userId: string): Promise<VideoStatisticEntity> {
        try {
            const res = await pool.query(`SELECT * FROM stat_of_videos WHERE video_id = $1 AND channel_id = $2`, [videoId, userId])
    
            return VideoStatisticEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error getStatOfVideoForUser repository: ${error}`)
        }
    }
}