import { pool } from "../../../utils/pg";
import { TagEntity } from "./video.entity";
import { IVideoRepository } from "./video.interface";

export class VideoRepository implements IVideoRepository {
    async getAllTags(): Promise<TagEntity[]> {
        try {
            const res = await pool.query("SELECT * FROM tags");
            return res.rows.map(row => new TagEntity(row))

        } catch (error) {
            throw new Error(`Error getTagList repository: ${error}`);
        }
    }
}