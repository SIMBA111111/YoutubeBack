import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { getVideoByHash } from "../repositories/video";
import { mapCommentsToIComment } from "../utils/maps/mapComment";

export const getCommentsByVideoHash = async (req: Request, res: Response) => {
    console.log('getCommentsByVideoHash');
    try {
        const { videoHash } = req.params;
        const { parentCommentId } = req.body;
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;

        let query = '';
        let countQuery = '';
        let params: any[] = [];

        if (parentCommentId) {
            // Получаем комментарии с подсчетом дочерних и информацией о канале
            query = `
                SELECT 
                    c.*,
                    (
                        SELECT COUNT(*) 
                        FROM comments 
                        WHERE parent_comment_id = c.id
                    ) as "repliesCount",
                    jsonb_build_object(
                        'id', ch.id,
                        'name', ch.name,
                        'username', ch.username,
                        'avatar_url', ch.avatar_url
                    ) as channel
                FROM comments c
                LEFT JOIN channels ch ON c.user_id = ch.id
                WHERE c.parent_comment_id = $1
                ORDER BY c.created_date ASC
                LIMIT $2 OFFSET $3
            `;
            params = [parentCommentId, limit, offset];
        } else {
            const video = await getVideoByHash(videoHash as string);
            if (!video) {
                return res.status(404).json({ error: 'Video not found' });
            }
            
            query = `
                SELECT 
                    c.*,
                    (
                        SELECT COUNT(*) 
                        FROM comments 
                        WHERE parent_comment_id = c.id
                    ) as "repliesCount",
                    jsonb_build_object(
                        'id', ch.id,
                        'name', ch.name,
                        'avatar_url', ch.avatar_url
                    ) as channel
                FROM comments c
                LEFT JOIN channels ch ON c.channel_id = ch.id
                WHERE c.video_id = $1
                ORDER BY c.created_date ASC
                LIMIT $2 OFFSET $3
            `;
            params = [video.id, limit, offset];
        }

        // Выполняем запросы параллельно
        const [commentsResult] = await Promise.all([
            pool.query(query, params),
        ]);

        const result = {
            comments: mapCommentsToIComment(commentsResult.rows),
            total: commentsResult.rows.length,
            offset,
            limit
        };
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error getCommentsByVideoHash:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};