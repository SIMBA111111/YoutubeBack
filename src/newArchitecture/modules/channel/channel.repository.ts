import { pool } from "../../shared/utils/pg";
import { ChannelEntity } from "./domain/channel.entity";
import { IChannelRepository } from "./domain/channel.interface";

export class ChannelRepository implements IChannelRepository {
    async getChannelById(channelId: string): Promise<ChannelEntity> {
            try {
            const res = await pool.query(
                `
                    SELECT ch.* 
                    FROM videos v 
                    JOIN channels ch ON v.channel_id = ch.id
                    WHERE video_hash = $1
                `,
                [channelId]
            );
        
            return res.rows[0];
        } catch (error) {
            throw new Error(`Error getChannelById repository: ${error}`);
        } 
    }
}