import { pool } from "../../shared/utils/pg";
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
            WHERE parent_comment_id = c.id
        `

        const result = await pool.query(query, [parentCommentId])

        return result.rows[0]
    }
}