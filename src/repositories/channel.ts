import { formatDate } from "../utils/formatDate";
import { getDateRangeInfo } from "../utils/getDateRangeCondition";
import { pool } from "../utils/pg";

export const getChannelsByUser = async (
  userId: string,
  offset: number,
  limit: number
) => {
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
      [userId, offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getChannelsByUser repository: ${error}`);
  }
};

export const getChannelById = async (channelId: string) => {
  try {
    const res = await pool.query(
      `
        SELECT * 
        FROM channels
        WHERE id = $1
        `,
      [channelId]
    );

    if (res.rows.length > 0) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getChannelById repository: ${error}`);
  }
};

export const getChannelByUsername = async (username: string) => {
  try {
    const res = await pool.query(
      `
            SELECT * 
            FROM channels
            WHERE username = $1
        `,
      [username]
    );

    if (res.rows.length > 0) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getChannelsByUsername repository: ${error}`);
  }
};

export const getChannelByVideoHash = async (videoHash: string) => {
  try {
    const res = await pool.query(
      `
            SELECT ch.* 
            FROM videos v 
            JOIN channels ch ON v.channel_id = ch.id
            WHERE video_hash = $1
        `,
      [videoHash]
    );

    if (res.rows.length > 0) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getChannelByVideoHash repository: ${error}`);
  }
};

export const updateSubsCountChannel = async (
  channelId: string,
  operation: "inc" | "decr"
) => {
  try {
    let res;

    if (operation === "inc") {
      res = await pool.query(
        `
                UPDATE channels SET subscribers_count = subscribers_count + 1 WHERE id = $1
            `,
        [channelId]
      );
    } else {
      res = await pool.query(
        `
                UPDATE channels SET subscribers_count = subscribers_count - 1 WHERE id = $1
            `,
        [channelId]
      );
    }

    if (res.rows.length > 0) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error updateSubsCountChannel repository: ${error}`);
  }
};

export const getLikedVideos = async (
  meId: string,
  isShort: boolean | null,
  offset: number = 0,
  limit: number = 20
) => {
  try {
    let query = `
      SELECT v.*, ch.id as channelId, ch.username as channelUsername, ch.avatar_url as channelAvatarUrl
      FROM videos v
      JOIN stat_of_videos sov ON sov.video_id = v.id 
      JOIN channels ch ON ch.id = v.channel_id
      WHERE sov.channel_id = $1 AND sov.liked = true
    `

    if (isShort === true) {
      query += `AND v.is_short = true`
    } else if (isShort === false) {
      query += `AND v.is_short = false`
    }

    query += ` OFFSET $2 LIMIT $3`

    const res = await pool.query(query, [meId, offset, limit])

    if (res.rows.length > 0) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getLikedVideos repository: ${error}`);
  }
};

export const getChannelHistory = async (
  meId: string,
  offset: string,
  limit: string
) => {
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelId, ch.username as channelUsername, ch.avatar_url as channelAvatarUrl
            FROM videos v
            JOIN stat_of_videos sov ON sov.video_id = v.id
            JOIN channels ch ON ch.id = v.channel_id
            WHERE sov.channel_id = $1
            ORDER BY sov.updated_date DESC
            OFFSET $2 LIMIT $3
        `,
      [meId, offset, limit]
    );

    if (res.rows.length > 0) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getChannelHistory repository: ${error}`);
  }
};


export const getIsSubOnChannelInfo = async (
  userId: string,
  channelId: string,
) => {
  try {
    const res = await pool.query(
      `
            SELECT *
            FROM subscriptions
            WHERE follower_channel_id=$1 AND channel_id=$2
        `,
      [userId, channelId]
    );

    if (res.rows.length > 0) return res.rows[0];

    return null;
  } catch (error) {
    throw new Error(`Error getIsSubOnChannelInfo repository: ${error}`);
  }
};


export const updateSaveHistoryByChannel = async (userId: string, isSaveHistory: boolean) => {
    try {
        const res = await pool.query('UPDATE channels SET is_save_history = $1 WHERE id=$2 RETURNING id, username, is_save_history', [isSaveHistory, userId]);      
        
        if (res.rows.length > 0) 
            return res.rows[0]

        return {}
    } catch (error) {
        throw new Error(`Error updateSaveHistoryByChannel repository: ${error}`)
    }
}


export const getAllSubscriptionsByChannel = async (userId: string) => {
    try {
        const res = await pool.query(`
          SELECT ch.id, ch.username
          FROM channels ch
          JOIN subscriptions subs ON subs.follower_channel_id = ch.id
          WHERE subs.channel_id = $1
          `, [userId]);      
        
        if (res.rows.length > 0) 
            return res.rows

        return {}
    } catch (error) {
        throw new Error(`Error getAllSubscriptionsByChannel repository: ${error}`)
    }
}



// Подписки - каждые 2 часа (для интервала 1 day)
export const getChannelSubsCountEvery2Hour = async (channelId: string, dateRange: string) => {
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
    
    const result: Record<string, string> = {};
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

// Подписки - каждые 12 часов (для интервала 3 days)
export const getChannelSubsCountEvery12Hour = async (channelId: string, dateRange: string) => {
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
    
    const result: Record<string, string> = {};
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

// Подписки - по дням (для остальных интервалов)
export const getChannelSubsCount = async (channelId: string, dateRange: string) => {
  console.log('getChannelSubsCount');
  
  try {
    const query = `
      SELECT 
        DATE(subs.updated_date) as date,
        COUNT(*)::INTEGER as count
      FROM channels ch
      JOIN subscriptions subs ON subs.follower_channel_id = ch.id
      WHERE subs.channel_id = $1
        AND subs.updated_date >= NOW() - INTERVAL '${dateRange}'
      GROUP BY DATE(subs.updated_date)
      ORDER BY DATE(subs.updated_date) ASC
    `;
    
    const res = await pool.query(query, [channelId]);
    
    const result: Record<string, string> = {};
    res.rows.forEach(row => {
      const date = new Date(row.date);
      const formattedDate = formatDate(date);
      result[formattedDate] = row.count;
    });
    
    return result;
  } catch (error) {
    throw new Error(`Error getChannelSubsCount repository: ${error}`)
  }
}


function formatDateWithHour(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const half = parseInt(hour) < 12 ? '00' : '12';
  return `${day}.${month}.${year} ${half}:00`;
}

function formatDateWithHour12(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const half = parseInt(hour) < 12 ? '00' : '12';
  return `${day}.${month}.${year} ${half}:00`;
}

export const getChannelViewsCount = async (channelId: string, dateRange: string) => {
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
};


// 2-часовые интервалы за последние сутки
export const getChannelViewsCountEvery2Hour = async (channelId: string, dateRange: string) => {
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
};

// 12-часовые интервалы за последние 3 дня
export const getChannelViewsCountEvery12Hour = async (channelId: string, dateRange: string) => {
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
};