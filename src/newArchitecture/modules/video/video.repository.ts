import { pool } from "../../../utils/pg";
import { FiltersEnum, SORT, TSort, TVideoAgeFilter, TVideoTypeFilter, VIDEO_TYPE_FILTER } from "./domain/video.consts";
import { TagEntity, VideoEntity } from "./domain/video.entity";
import { IVideoRepository } from "./domain/video.interface";

export class VideoRepository implements IVideoRepository {
    async getAllTags(): Promise<TagEntity[]> {
        try {
            const res = await pool.query("SELECT * FROM tags");
            return TagEntity.fromDbRows(res.rows)

        } catch (error) {
            throw new Error(`Error getAllTags repository: ${error}`);
        }
    }

    async getTagsByName(tagName: string): Promise<TagEntity> {
        try {
            const res = await pool.query("SELECT * FROM tags WHERE name=$1", [tagName]);
            return TagEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error getTagsByName repository: ${error}`);
        }        
    }

    async getOrderedVideoList(sortByDatePublication: TSort, offset: number, limit: number): Promise<VideoEntity[]> {
        try {
            const order = sortByDatePublication === SORT.DESC ? SORT.DESC : SORT.ASC;
            const res = await pool.query(`
                SELECT v.*, ch.id as channelid, ch.username as channelusername, 
                    ch.avatar_url as channelavatarurl, ch.name as channelname
                FROM videos v
                LEFT JOIN channels ch ON ch.id = v.channel_id
                ORDER BY date_publication ${order}
                OFFSET $1 LIMIT $2
            `, [offset, limit]);
            
            
            return VideoEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getOrderedVideoList repository: ${error}`);
        }
    }


    async getVideoList(offset: number, limit: number, isShort: boolean | null = null): Promise<VideoEntity[]> {
        console.log('getVideoList REPO REPO REPO REPO');
        try {

            const params = isShort ? [offset, limit, isShort] : [offset, limit]

            const res = await pool.query(
            `
                SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname
                FROM videos v
                JOIN channels ch ON ch.id = v.channel_id 
                OFFSET $1 LIMIT $2   
            `, params
            );

            
            return VideoEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getVideoList repository: ${error}`);
        }
    }


    async getVideoListByTag(tagId: string, offset: number, limit: number): Promise<VideoEntity[]> {
        console.log('getVideoListByTag');
        try {
            const res = await pool.query("SELECT * FROM videos WHERE $1 = ANY (tags)", [
                tagId,
            ]);

            return VideoEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getVideoListByTag repository: ${error}`);
        }
    }


    async getVideosByFollowedChannels(channelId: string, offset: number, limit: number): Promise<VideoEntity[]> {
        console.log('getVideosByFollowedChannels');
  
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

            return VideoEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getVideosByFollowedChannels repository: ${error}`);
        }
    }


    async getViewedVideos(channelId: string, offset: number, limit: number): Promise<VideoEntity[]> {
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

            return VideoEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getViewedVideosByChannelId repository: ${error}`);
        }
    }

    async getVideoListByName(VideoName: string, offset: number, limit: number, isFullObj: boolean = false): Promise<VideoEntity[]> {
        try {

            let query = ''

            if (isFullObj) {
                query = `SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl, ch.name as channelname
                FROM videos v
                JOIN channels ch ON ch.id = v.channel_id
                where v.name ilike $1 
                offset $2 limit $3`
            } else {
                query = "select id, name, video_hash from videos where name ilike $1 offset $2 limit $3"
            }

            const res = await pool.query(
                query,
                [`%${VideoName}%`, offset, limit]
            );

            return VideoEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getVideoListByName repository: ${error}`);
        }
    }

    async getVideoListBySubs(followerId: string, offset: number, limit: number, videoTypeFilter: TVideoTypeFilter): Promise<VideoEntity[]> {
        try {
            let filterCondition = '';
            const params: any[] = [followerId];

            if (videoTypeFilter === VIDEO_TYPE_FILTER.ONLY_SHORTS) {
                filterCondition = 'AND v.is_short = true';
            } else if (videoTypeFilter === VIDEO_TYPE_FILTER.ONLY_FULL) {
                filterCondition = 'AND v.is_short = false';
            }

            const query = `
                SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
                FROM videos v
                JOIN channels ch ON ch.id = v.channel_id   
                JOIN subscriptions s ON s.channel_id = ch.id
                WHERE s.follower_channel_id = $1
                ${filterCondition}
                ORDER BY v.date_publication DESC
                OFFSET $2 LIMIT $3
            `;

            const res = await pool.query(query, [...params, offset, limit]);
            
            return VideoEntity.fromDbRows(res.rows);
        } catch (error) {
            throw new Error(`Error getVideoListBySubs repository: ${error}`);
        }
    }

    async getVideoListByOwnerUsername(channelUsername: string, filter: TVideoAgeFilter, isShort: boolean, offset: number, limit: number): Promise<VideoEntity[]> {
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
        
            return res.rows;
        } catch (error) {
            throw new Error(`Error getVideoListByOwnerUsername repository: ${error}`);
        }
    }

    async getVideoById(videoId: string): Promise<VideoEntity> {
         try {
            const res = await pool.query(`
                SELECT * FROM videos WHERE id=$1`,
            [videoId]);

            return res.rows[0];

        } catch (error) {
            throw new Error(`Error getVideoById repository: ${error}`);
        }
    }

    async getRecommendedVideos(videoId: string, offset: number, limit: number): Promise<VideoEntity[]> {
        try {
            const res = await pool.query(
            `
                SELECT v.*, ch.id as channelid, ch.username as channelusername, ch.avatar_url as channelavatarurl
                FROM videos v
                JOIN channels ch ON ch.id = v.channel_id   
                WHERE v.id != $3                   
                OFFSET $1 LIMIT $2  
            `,
            [offset, limit, videoId]
            );

            if (res.rows) return res.rows;

            return [];
        } catch (error) {
            throw new Error(`Error getRecommendedVideosRepo repository: ${error}`);
        }
    }

    async getVideosIds(offset: number, limit: number, isShortVideo: boolean): Promise<string[]> {
        try {
            const res = await pool.query(`
            SELECT id FROM videos
            WHERE is_short = $3
            OFFSET $1 LIMIT $2   
            `, [offset, limit, isShortVideo]);
            
            if (res.rows) return res.rows;

            return [];
        } catch (error) {
            throw new Error(`Error getVideosIds repository: ${error}`);
        }
    }

    async updateVideoViewsById(videoId: string): Promise<Boolean> {
        try {
            const res = await pool.query(
            `   WITH updated_video AS (
                    UPDATE videos 
                    SET viewers_count = viewers_count + 1 
                    WHERE id = $1
                    RETURNING channel_id
                )
                UPDATE channels 
                SET viewers_count = viewers_count + 1
                FROM updated_video
                WHERE channels.id = updated_video.channel_id
                RETURNING updated_video.channel_id;
            `,
            [videoId]
            );

            return !!res.rows[0];
        } catch (error) {
            throw new Error(`Error updateVideoViews repository: ${error}`);
        }
    }

    async updateVideoViewsForAnal(videoId: string, viewerId: string): Promise<boolean> {
        try {
            const res = await pool.query(
            `INSERT INTO video_views (video_id, channel_id) 
                VALUES ($1, $2) 
                RETURNING *`,
            [videoId, viewerId]
            );

            return res.rows[0] || {};
        } catch (error) {
            throw new Error(`Error updateVideoViewsForAnal repository: ${error}`);
        }
    }
}