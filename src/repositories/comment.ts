import { pool } from "../utils/pg";

export const getCommentsByVideoHashRepo = async (
  videoId: string,
  offset: number,
  limit: number,
  filter: string,
  userId: string
) => {
  try {
    let query = `
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
                ) as channel,
                soc.liked as user_liked,
                soc.disliked as user_disliked,
                soc.id as user_stat_id
            FROM comments c
            INNER JOIN channels ch ON c.channel_id = ch.id
            LEFT JOIN stat_of_comments soc ON soc.comment_id = c.id AND soc.channel_id = $4::uuid
            WHERE c.video_id = $1::uuid AND c.parent_comment_id IS NULL
        `;

    if (filter === "famous") {
      query += " ORDER BY c.like_count DESC, c.created_date DESC";
    } else {
      query += " ORDER BY c.created_date DESC";
    }

    query += " LIMIT $2::int OFFSET $3::int";

    const params = [videoId, limit, offset, userId];
    const res = await pool.query(query, params);

    return res.rows;
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error(`Error getCommentsByVideoHashRepo repository: ${error}`);
  }
};

export const getCommentsByParentCommentId = async (
  parentCommentId: string,
  offset: number,
  limit: number,
  userId: string
) => {
  try {
    let query = `
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
                ) as channel,
                soc.liked as user_liked,
                soc.disliked as user_disliked,
                soc.id as user_stat_id
            FROM comments c
            INNER JOIN channels ch ON c.channel_id = ch.id
            LEFT JOIN stat_of_comments soc ON soc.comment_id = c.id AND soc.channel_id = $4::uuid
            WHERE c.parent_comment_id = $1::uuid
        `;

    query += " LIMIT $2::int OFFSET $3::int";

    const params = [parentCommentId, limit, offset, userId];
    const res = await pool.query(query, params);

    console.log(res.rows);

    return res.rows || [];
  } catch (error) {
    throw new Error(`Error getCommentsByParentCommentId repository: ${error}`);
  }
};

export const crateCommentRepo = async (
  commentText: string,
  videoId: string,
  userId: string
) => {
  try {
    const res = await pool.query(
      `
            INSERT INTO comments (text, video_id, channel_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
      [commentText, videoId, userId]
    );

    if (res.rows) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error crateCommentRepo repository: ${error}`);
  }
};


export const deleteCommentRepo = async (
  commentId: string,
  userId?: string // опционально для проверки прав
) => {
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
      return {
        success: true,
        deletedCount: res.rows.length,
        deletedIds: res.rows.map(row => row.id)
      };
    }

    return {
      success: false,
      deletedCount: 0,
      deletedIds: []
    };
  } catch (error) {
    throw new Error(`Error deleteCommentRepo repository: ${error}`);
  }
};




// export const getCommentStatByUserIdRepo = async (userId: string, videoId: string) => {
//     try {
//         const res = await pool.query(`
//             SELECT *
//             FROM stat_of_comments soc
//             JOIN videos v ON v.id = soc.
//             WHERE channel_id = $1 AND v.id = $2

//         `, [userId, videoId])

//         if (res.rows)
//             return res.rows[0]

//         return {}
//     } catch (error) {
//         throw new Error(`Error crateCommentRepo repository: ${error}`)
//     }
// }
