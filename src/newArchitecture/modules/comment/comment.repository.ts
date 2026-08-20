import { pool } from "../../shared/utils/pg";
import { TCommentFilters, COMMENTS_FILTERS, TCommentActions, COMMENTS_ACTIONS } from "./comment.consts";
import { CommentEntity, ICommentEntity } from "./comment.entity";
import { ICommentRepository } from "./comment.interface";

export class CommentRepository implements ICommentRepository{
    async getRepliesComment(parentCommentId: string, userId: string, offset: number, limit: number): Promise<ICommentEntity[]> {
        const query = `
            SELECT 
                c.*,
                jsonb_build_object(
                    'id', ch.id,
                    'name', ch.name,
                    'avatar_url', ch.avatar_url
                ) as channel,
                soc.liked as user_liked,
                soc.disliked as user_disliked,
                soc.id as user_stat_id
            FROM comments c
            INNER JOIN channels ch ON c.channel_id = ch.id
            LEFT JOIN stat_of_comments soc ON soc.comment_id = c.id AND soc.channel_id = $4::uuid
            WHERE c.parent_comment_id = $1::uuid
            LIMIT $2::int OFFSET $3::int
        `;

        const result = await pool.query(query, [parentCommentId, limit, offset, userId]);

        return result.rows.map(row => new CommentEntity({
            id: row.id,
            text: row.text,
            likeCount: row.likeCount || 0,
            dislikeCount: row.dislikeCount || 0,
            videoId: row.videoId,
            channelId: row.channelId,
            parentCommentId: row.parentCommentId,
            createdDate: row.createdDate,
            updatedDate: row.updatedDate,
        }));
    }

    async getRepliesCommentCount(parentCommentId: string): Promise<number> {
        const query = `
            SELECT COUNT(*) 
            FROM comments 
            WHERE parent_comment_id = $1
        `

        const result = await pool.query(query, [parentCommentId])

        return result.rows[0]
    }

    async getCommentsByVideoId(videoId: string, userId: string, filter: TCommentFilters, offset: number, limit: number): Promise<ICommentEntity[]> {
        let query = `
            SELECT 
                c.*,
                jsonb_build_object(
                    'id', ch.id,
                    'name', ch.name,
                    'avatar_url', ch.avatar_url
                ) as channel,
                soc.liked as user_liked,
                soc.disliked as user_disliked,
                soc.id as user_stat_id
            FROM comments c
            INNER JOIN channels ch ON c.channel_id = ch.id
            LEFT JOIN stat_of_comments soc ON soc.comment_id = c.id AND soc.channel_id = $4::uuid
            WHERE c.video_id = $1::uuid AND c.parent_comment_id IS NULL
        `;
    
        if (filter === COMMENTS_FILTERS.FAMOUS) {
            query += " ORDER BY c.like_count DESC, c.created_date DESC";
        } else {
            query += " ORDER BY c.created_date DESC";
        }
    
        query += " LIMIT $2::int OFFSET $3::int";
    
        const params = [videoId, limit, offset, userId]
        const result = await pool.query(query, params)
    
        return result.rows.map(row => new CommentEntity({
            id: row.id,
            text: row.text,
            likeCount: row.likeCount || 0,
            dislikeCount: row.dislikeCount || 0,
            videoId: row.videoId,
            channelId: row.channelId,
            parentCommentId: row.parentCommentId,
            createdDate: row.createdDate,
            updatedDate: row.updatedDate,
        }));
    }

    async getVideoCommentsCount(videoId: string): Promise<number> {
        const query = `
            SELECT COUNT(*) 
            FROM comments 
            WHERE id = $2
        `

        const result = await pool.query(query, [videoId])    
        
        return result.rows[0]
    }

    async createComment(commentText: string, videoId: string, userId: string): Promise<CommentEntity> {
        try {
            const res = await pool.query(
                `
                    INSERT INTO comments (text, video_id, channel_id)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `,
                [commentText, videoId, userId]
            );
        
            return res.rows[0];
    
        } catch (error) {
            throw new Error(`Error createComment repository: ${error}`);
        }
    }

    async deleteComment(commentId: string): Promise<boolean> {
        try {
            // Вариант 1: Использование CTE (Common Table Expression) для рекурсивного удаления
            const res = await pool.query(
            `
                WITH RECURSIVE comment_tree AS (
                    -- Базовый запрос: ищем удаляемый комментарий
                    SELECT id, parent_comment_id
                    FROM comments
                    WHERE id = $1
                    
                    UNION ALL
                    
                    -- Рекурсивный запрос: находим все дочерние комментарии
                    SELECT c.id, c.parent_comment_id
                    FROM comments c
                    INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
                ),
                comments_to_delete AS (
                    SELECT id FROM comment_tree
                )
                -- Удаляем все найденные комментарии
                DELETE FROM comments
                WHERE id IN (SELECT id FROM comments_to_delete)
                RETURNING id, parent_comment_id
            `,
            [commentId]
            );

            if (res.rows.length > 0) {
                return true
            }

            return false
        } catch (error) {
            throw new Error(`Error deleteComment repository: ${error}`);
        }
    }

    async updateCommentLikeCount(commentId: string, action: TCommentActions): Promise<CommentEntity> {
        try {
            let updatedComment

            if (action === COMMENTS_ACTIONS.INCREASE) {
                updatedComment = await pool.query(
                        `UPDATE comments SET like_count = like_count + 1 WHERE id = $1 RETURNING *`,
                    [commentId]
                );
            }

            if (action === COMMENTS_ACTIONS.DECREASE) {
                updatedComment = await pool.query(
                        `UPDATE comments SET like_count = like_count - 1 WHERE id = $1 RETURNING *`,
                    [commentId]
                );
            }   

            return new CommentEntity({
                id: updatedComment?.rows[0].id,
                text: updatedComment?.rows[0].text,
                likeCount: updatedComment?.rows[0].likeCount || 0,
                dislikeCount: updatedComment?.rows[0].dislikeCount || 0,
                videoId: updatedComment?.rows[0].videoId,
                channelId: updatedComment?.rows[0].channelId,
                parentCommentId: updatedComment?.rows[0].parentCommentId,
                createdDate: updatedComment?.rows[0].createdDate,
                updatedDate: updatedComment?.rows[0].updatedDate,  
            })
        } catch (error) {
            throw new Error(`Error updateCommentLikeCount repository: ${error}`);
        }
    }

    async updateCommentDislikeCount(commentId: string, action: TCommentActions): Promise<CommentEntity> {
        try {
            let updatedComment

            if (action === COMMENTS_ACTIONS.INCREASE) {
                updatedComment = await pool.query(
                        `UPDATE comments SET dislike_count = dislike_count + 1 WHERE id = $1 RETURNING *`,
                    [commentId]
                );
            }

            if (action === COMMENTS_ACTIONS.DECREASE) {
                updatedComment = await pool.query(
                        `UPDATE comments SET dislike_count = dislike_count - 1 WHERE id = $1 RETURNING *`,
                    [commentId]
                );
            }   

            return new CommentEntity({
                id: updatedComment?.rows[0].id,
                text: updatedComment?.rows[0].text,
                likeCount: updatedComment?.rows[0].likeCount || 0,
                dislikeCount: updatedComment?.rows[0].dislikeCount || 0,
                videoId: updatedComment?.rows[0].videoId,
                channelId: updatedComment?.rows[0].channelId,
                parentCommentId: updatedComment?.rows[0].parentCommentId,
                createdDate: updatedComment?.rows[0].createdDate,
                updatedDate: updatedComment?.rows[0].updatedDate,  
            })
        } catch (error) {
            throw new Error(`Error updateCommentDislikeCount repository: ${error}`);
        }
    }
}