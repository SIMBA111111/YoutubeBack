import { pool } from "../../shared/utils/pg";
import { CommentStatisticEntity } from "./statistic.entity";
import { IStatisticRepository } from "./statistic.interface";

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
}