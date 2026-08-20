import { pool } from "../../shared/utils/pg";
import { IVideoRepository } from "./video.interface";

export class VideoRepository implements IVideoRepository{
    async updateVideoCommentCount(videoId: string): Promise<number> {
        try {
            const res = await pool.query(
                `UPDATE videos SET comments_count = comments_count + 1 WHERE id = $1 RETURNING comments_count`,
                [videoId]
            );

            return res.rows[0];

        } catch (error) {
            throw new Error(`Error updateVideoCommentCount repository: ${error}`);
        }
    }
}