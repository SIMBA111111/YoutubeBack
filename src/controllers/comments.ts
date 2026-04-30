import { Request, Response } from "express";
import { pool } from "../utils/pg";
import { getVideoByHashRepo } from "../repositories/video";
import { mapCommentsToIComment } from "../utils/maps/mapComment";
import { crateCommentRepo, getCommentsByParentCommentId, getCommentsByVideoHashRepo } from "../repositories/comment";

export const getCommentsByVideoHash = async (req: Request, res: Response) => {
    console.log('getCommentsByVideoHash');
    try {
        const { videoHash } = req.params;
        const { parentCommentId } = req.body;
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;

        let comments = []

        if (parentCommentId) {
            // Получаем комментарии с подсчетом дочерних и информацией о канале
            comments = await getCommentsByParentCommentId(parentCommentId, offset, limit);

        } else {
            const video = await getVideoByHashRepo(videoHash as string);
            if (!video) {
                return res.status(404).json({ error: 'Video not found' });
            }

            comments = await getCommentsByVideoHashRepo(video.id, offset, limit);
        }

        const result = {
            comments: mapCommentsToIComment(comments),
            total: comments.length,
            offset,
            limit
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('Error getCommentsByVideoHash:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getRepliesComment = async (req: Request, res: Response) => {
    console.log('getRepliesComment');
    try {
        const { parentCommentId } = req.body;
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;

        const response = await getCommentsByParentCommentId(parentCommentId as string, offset, limit);


        const result = {
            comments: response,
            total: response.length
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error getRepliesComment:', error);
        res.status(500).json({ error: 'Internal server error2' });
    }
};


export const createComment = async (req: Request, res: Response) => {
    console.log('createComment');
    try {
        const { videoId } = req.params
        const { commentText, userId } = req.body
        const cookies = req.cookies

        const response = await crateCommentRepo(commentText, videoId as string, userId)

        return res.status(201).json('comment added');
    } catch (error) {
        console.error('Error createComment:', error);
        res.status(500).json({ error: 'Internal server error2' });
    }
};

export const markComment = async (req: Request, res: Response) => {
    console.log('markComment');
    try {
        const { commentId } = req.params;
        const { userId, isLiked, isDisliked } = req.body;

        // Проверяем, существует ли запись статистики
        const commentStatRes = await pool.query(
            `SELECT * FROM stat_of_comments WHERE channel_id = $1 AND comment_id = $2`,
            [userId, commentId]
        );
        const oldStat = commentStatRes.rows[0];

        let oldLiked = false;
        let oldDisliked = false;

        if (oldStat) {
            oldLiked = oldStat.liked;
            oldDisliked = oldStat.disliked;
            
            // Обновляем существующую запись
            await pool.query(
                `UPDATE stat_of_comments 
                 SET liked = $1, disliked = $2 
                 WHERE channel_id = $3 AND comment_id = $4`,
                [isLiked, isDisliked, userId, commentId]
            );
        } else {
            // Создаем новую запись
            await pool.query(`
                INSERT INTO stat_of_comments (channel_id, comment_id, liked, disliked) 
                VALUES ($1, $2, $3, $4)
            `, [userId, commentId, isLiked, isDisliked]
            );
        }

        // Обновляем счетчики rjvvtynf
        // Сначала обрабатываем лайки
        if (oldLiked !== isLiked) {
            if (isLiked) {
                await pool.query(`UPDATE comments SET like_count = like_count + 1 WHERE id = $1`, [commentId]);
            } else {
                await pool.query(`UPDATE comments SET like_count = like_count - 1 WHERE id = $1`, [commentId]);
            }
        }

        // Обрабатываем дизлайки
        if (oldDisliked !== isDisliked) {
            if (isDisliked) {
                await pool.query(`UPDATE comments SET dislike_count = dislike_count + 1 WHERE id = $1`, [commentId]);
            } else {
                await pool.query(`UPDATE comments SET dislike_count = dislike_count - 1 WHERE id = $1`, [commentId]);
            }
        }

        // Получаем обновленную статистику для ответа
        const updatedStatsRes = await pool.query(
            `SELECT liked, disliked FROM stat_of_comments 
             WHERE channel_id = $1 AND comment_id = $2`,
            [userId, commentId]
        );
        const updatedStats = updatedStatsRes.rows[0];

        res.status(200).json({ 
            success: true, 
            stats: updatedStats 
        });
        
    } catch (error) {
        console.error('Error markComment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const replyComment = async (req: Request, res: Response) => {
    console.log('replyComment');
    try {
        const { parentCommentId } = req.params
        const { commentText, userId, videoId } = req.body
        const cookies = req.cookies

        const response = await pool.query(`
            INSERT INTO comments (text, video_id, channel_id, parent_comment_id)
            VALUES ($1, $2, $3, $4)
        `, [commentText, videoId, userId, parentCommentId])

        return res.status(201).json('replied comment');
    } catch (error) {
        console.error('Error replyComment:', error);
        res.status(500).json({ error: 'Internal server error2' });
    }
};