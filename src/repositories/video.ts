import { log } from "console";
import { pool } from "../utils/pg";

export const getTagList = async () => {
  try {
    const res = await pool.query("SELECT * FROM tags");
    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getTagList repository: ${error}`);
  }
};

export const getTagById = async (tagId: string) => {
  try {
    const res = await pool.query("SELECT * FROM tags WHERE id=$1", [tagId]);
    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getTagById repository: ${error}`);
  }
};

export const getTagByName = async (tagName: string) => {
  try {
    const res = await pool.query("SELECT * FROM tags WHERE name=$1", [tagName]);
    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getTagByName repository: ${error}`);
  }
};

export const getVideoList = async (offset: number = 0, limit: number = 20) => {
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id 
            OFFSET $1 LIMIT $2   
        `,
      [offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoList repository: ${error}`);
  }
};

export const getVideoListBySubs = async (
  meId: string,
  offset: string,
  limit: string
) => {
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id   
            JOIN subscriptions s ON s.channel_id = ch.id
            WHERE s.follower_channel_id = $1
            OFFSET $2 LIMIT $3   
        `,
      [meId, offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoListBySubs repository: ${error}`);
  }
};

export const getVideoListBySubsIsShorts = async (
  meId: string,
  onlyShorts: boolean,
  offset: string,
  limit: string
) => {
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id   
            JOIN subscriptions s ON s.channel_id = ch.id
            WHERE s.follower_channel_id = $1 AND v.is_short=$2
            OFFSET $3 LIMIT $4   
        `,
      [meId, onlyShorts, offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoListBySubs repository: ${error}`);
  }
};

export enum FiltersEnum {
    NEWS='NEWS',
    FAME='FAME',
    OLD='OLD'
}

export const getVideoListByUsername = async (
  channelUsername: string,
  filter: keyof typeof FiltersEnum,
  isShort: boolean,
  offset: string,
  limit: string
) => {
  try {
    let query = `
      SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
      FROM videos v
      JOIN channels ch ON ch.id = v.channel_id
      WHERE ch.username = $1 AND v.is_short = $2
    `
    
    if(filter === FiltersEnum.NEWS) {
      query += 'ORDER BY date_publication DESC'
    }

    if(filter === FiltersEnum.OLD) {
      query += 'ORDER BY date_publication ASC'
    }
    
    if(filter === FiltersEnum.FAME) {
      query += 'ORDER BY viewers_count DESC'
    }

    query += ` OFFSET $3 LIMIT $4`

    const res = await pool.query(query, [channelUsername, isShort, offset, limit])

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoListByUsername repository: ${error}`);
  }
};

export const getShortVideoListByUsername = async (
  channelUsername: string,
  offset: string,
  limit: string
) => {
  try {
    const res = await pool.query(
      `
            SELECT v.* 
            FROM videos v
            JOIN channels ch ON ch.id = v.channel_id
            WHERE ch.username = $1 AND v.is_short = true
            OFFSET $2 LIMIT $3
        `,
      [channelUsername, offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getShortVideoListByUsername repository: ${error}`);
  }
};






export const getVideoListByTag = async (tagId: string) => {
  try {
    const res = await pool.query("SELECT * FROM videos WHERE $1 = ANY (tags)", [
      tagId,
    ]);
    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoListByTag repository: ${error}`);
  }
};






export const getViewedVideoListByTag = async (tagId: string, offset: number = 0, limit: number = 20, channelId: string | null = null) => {
  console.log('getViewedVideoListByTag');
  
  try {

    const tag = await getTagByName(tagId)

    console.log('tag', tag );
    

    let query = `
      SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname
      FROM videos v
      JOIN channels ch ON ch.id = v.channel_id
      JOIN stat_of_videos sov ON sov.video_id = v.id
      WHERE $1 = ANY (v.tags) AND sov.channel_id = $2
    `;

    const params: any[] = [tag.id, channelId, offset, limit];


    query += `ORDER BY sov.updated_date DESC`;
    query += `OFFSET $3 LIMIT $4`;

    console.log('Generated query:', query);
    console.log('Parameters:', params);

    const res = await pool.query(query, params);
    
    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoListByTag repository: ${error}`);
  }
};




export const getVideoListByNameRepo = async (videoName: string) => {
  try {
    const res = await pool.query(
      "select id, name from videos where name ilike $1",
      [`%${videoName}%`]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideoListByName repository: ${error}`);
  }
};

export const getVideoByHashRepo = async (videoHash: string) => {
  try {
    const res = await pool.query("SELECT * FROM videos WHERE video_hash = $1", [
      videoHash,
    ]);
    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getVideoByHash repository: ${error}`);
  }
};

export const getVideoByIdRepo = async (videoId: string) => {
  console.log('getVideoByIdRepo ', videoId);
  
  try {
    const res = await pool.query("select * from videos where id=$1", [videoId]);

    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error getVideoById repository: ${error}`);
  }
};

export const getOrderedVideoList = async (order: "DESC" | "ASC", offset: number, limit: number) => {
  try {
    let res;

    if (order === "DESC") {
      res = await pool.query(`
        SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname
        FROM videos v
        LEFT JOIN channels ch ON ch.id = v.channel_id
        ORDER BY date_publication DESC
        OFFSET $1 LIMIT $2
      `, [offset, limit]);
    } else {
      res = await pool.query(`
        SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
        FROM videos v
        LEFT JOIN channels ch ON ch.id = v.channel_id
        ORDER BY date_publication ASC
        OFFSET $1 LIMIT $2
      `, [offset, limit]);
    }

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getOrderedVideoList repository: ${error}`);
  }
};

export const getVideosFollowedChannels = async (channelId: string, offset: number, limit: number) => {
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname
            FROM videos v
            JOIN subscriptions s ON v.channel_id = s.channel_id
            JOIN channels ch ON ch.id = v.channel_id
            WHERE s.follower_channel_id = $1
            ORDER BY v.date_publication DESC
            OFFSET $2 LIMIT $3
        `,
      [channelId, offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getVideosFollowedChannels repository: ${error}`);
  }
};

export const getViewedVideosByChannelId = async (channelId: string, offset: number, limit: number) => {
  console.log('getViewedVideosByChannelId');
  
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname, sov.updated_date as dateViewed
            FROM videos v
            JOIN stat_of_videos sov ON v.id = sov.video_id
            JOIN channels ch ON ch.id = v.channel_id
            WHERE sov.views_count > 0 AND sov.channel_id = $1
            ORDER BY sov.updated_date DESC
            OFFSET $2 LIMIT $3
        `,
      [channelId, offset, limit]
    );



    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getViewedVideosByChannelId repository: ${error}`);
  }
};

export const getViewedShortVideosByChannelId = async (channelId: string, isShort: boolean, offset: number, limit: number) => {
  console.log('getViewedVideosByChannelId');
  console.log('channelId = ', channelId);
  console.log('offset', offset);
  console.log('limit', limit);
  console.log('isShort', isShort);
  
  try {
    const res = await pool.query(
      `
            SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname, sov.updated_date as dateViewed
            FROM videos v
            JOIN stat_of_videos sov ON v.id = sov.video_id
            JOIN channels ch ON ch.id = v.channel_id
            WHERE sov.views_count > 0 AND sov.channel_id = $1 AND v.is_short=$2
            ORDER BY sov.updated_date DESC
            OFFSET $3 LIMIT $4
        `,
      [channelId, isShort, offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getViewedVideosByChannelId repository: ${error}`);
  }
};


export const getRecommendedVideosRepo = async (
  offset: string,
  limit: string
) => {
  try {
    const res = await pool.query(
      `
        SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
        FROM videos v
        JOIN channels ch ON ch.id = v.channel_id 
        OFFSET $1 LIMIT $2   
    `,
      [offset, limit]
    );

    if (res.rows) return res.rows;

    return [];
  } catch (error) {
    throw new Error(`Error getRecommendedVideosRepo repository: ${error}`);
  }
};

export const updateVideoLikes = async (
  videoId: string,
  operation: "inc" | "decr"
) => {
  try {
    let res;

    if (operation === "inc") {
      res = await pool.query(
        `UPDATE videos SET likes_count = likes_count + 1 WHERE id = $1`,
        [videoId]
      );
    } else {
      res = await pool.query(
        `UPDATE videos SET likes_count = likes_count - 1 WHERE id = $1`,
        [videoId]
      );
    }

    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error updateVideoLikes repository: ${error}`);
  }
};

export const updateVideoDislikes = async (
  videoId: string,
  operation: "inc" | "decr"
) => {
  try {
    let res;

    if (operation === "inc") {
      res = await pool.query(
        `UPDATE videos SET dislikes_count = dislikes_count + 1 WHERE id = $1`,
        [videoId]
      );
    } else {
      res = await pool.query(
        `UPDATE videos SET dislikes_count = dislikes_count - 1 WHERE id = $1`,
        [videoId]
      );
    }

    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error updateVideoDislikes repository: ${error}`);
  }
};


export const updateVideoViews = async (videoId: string) => {
  try {
    const res = await pool.query(
      `WITH updated_video AS (
        UPDATE videos 
        SET viewers_count = viewers_count + 1 
        WHERE id = $1
        RETURNING channel_id
      )
      UPDATE channels 
      SET viewers_count = viewers_count + 1
      FROM updated_video
      WHERE channels.id = updated_video.channel_id
      RETURNING updated_video.channel_id;`,
      [videoId]
    );

    if (res.rows[0]) return res.rows[0];

    return {};
  } catch (error) {
    throw new Error(`Error updateVideoViews repository: ${error}`);
  }
};


export const createVideoRepo = async (
  videoId: string,
  videoName: string, 
  videoDescription: string, 
  masterM3U8Path: string, 
  thumbnailUrl: string, 
  previewUrl: string, 
  fragments: any[], 
  channelId: string,
  duration: number,
  isShort: boolean = false
) => {
  try {

    console.log('videoName = ', videoName);
    console.log('videoDescription = ', videoDescription);
    console.log('masterM3U8Path = ', masterM3U8Path);
    console.log('thumbnailUrl = ', thumbnailUrl);
    console.log('fragments = ', fragments);
    console.log('channelId = ', channelId);

    const createdVideo = await pool.query(`
      INSERT INTO videos    
      (id, name, duration, thumbnail_url, video_preview_url, master_m3u8_url, description, channel_id, is_short, video_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [videoId, videoName, duration, thumbnailUrl, previewUrl, masterM3U8Path, videoDescription, channelId, false, 'asdkoaksdopkoapskdopkaopskd'])
    
    const createdVideoId = createdVideo.rows[0].id;

    await Promise.all(fragments.map(frag => 
      pool.query(`
        INSERT INTO video_fragments    
        (name, start_time, end_time, video_id)
        VALUES ($1, $2, $3, $4)
      `, [frag.title, frag.start, frag.end, createdVideoId])
    ));
    
    if (createdVideo.rows[0]) return createdVideo.rows[0]

    return {};
  } catch (error) {
    throw new Error(`Error createVideoRepo repository: ${error}`);
  }
};
