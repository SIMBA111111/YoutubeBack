import { pool } from "../utils/pg"

export const getCommentsByVideoHashRepo = async (videoId: string, offset: number, limit: number) => {
    try {
        const query = `
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
        const params = [videoId, limit, offset];

        // Выполняем запросы параллельно
        const res = await pool.query(query, params)

        
        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getCommentsByVideoHashRepo repository: ${error}`)
    }
}


export const getCommentsByParentCommentId = async (parentCommentId: string, offset: number, limit: number) => {
    try {
        const query = `
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
        const params = [parentCommentId, limit, offset];

        // Выполняем запросы параллельно
        const res = await pool.query(query, params)

        
        if (res.rows) 
            return res.rows

        return []
    } catch (error) {
        throw new Error(`Error getCommentsByParentCommentId repository: ${error}`)
    }
}


export const crateCommentRepo = async (commentText: string, videoId: string, userId: string) => {
    try {
        const res = await pool.query(`
            INSERT INTO comments (text, video_id, channel_id)
            VALUES ($1, $2, $3)
        `, [commentText, videoId, userId])

        
        if (res.rows) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error crateCommentRepo repository: ${error}`)
    }
}
