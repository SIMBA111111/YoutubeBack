import { NOTIF_TYPES } from "../../shared/types";
import { pool } from "../../shared/utils/pg";
import { NotifEntity } from "./domain/notif.entity";
import { INotifRepository } from "./domain/notif.interface";

export class NotifRepository implements INotifRepository {
    async createNewVideoNotifs(videoId: string, consumerIds: string[], notifTypeId: string): Promise<NotifEntity> {
        try {
            if (!consumerIds || consumerIds.length === 0) {
                return null;
            }
        
            const res = await pool.query(
                `
                INSERT INTO notifications (video_id, channel_id, notif_type_id)
                SELECT $1, unnest($2::uuid[]), $3
                RETURNING *
                `,
                [videoId, consumerIds, notifTypeId]
            );
        
            if (res.rows.length > 0) {
                return res.rows;
            }
        
            return null;
        } catch (error) {
            throw new Error(`Error createNewVideoNotifs repository: ${error}`);
        }
    }

    async getNotifType(notifType: keyof keyof NOTIF_TYPES): Promise<NotifEntity | null> {
        try {
            if (!notifType)
                return null
            

            const res = await pool.query(
                `SELECT id, name FROM notif_types WHERE name = $1`,
                [notifType]
            );

            return NotifEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error getNotifType repository: ${error}`);
        }
    }

    async getNotifsByUserId(userId: string): Promise<NotifEntity[]> {
        try {
            const res = await pool.query(
            `
                SELECT n.*, nt.name as notif_name, v.name as video_name, v.video_hash, v.is_short, v.thumbnail_url, ch.name as channel_name, ch.avatar_url  
                FROM notifications n
                JOIN channels ch ON ch.id = n.channel_id
                JOIN videos v ON v.id = n.video_id
                JOIN notif_types nt ON nt.id = n.notif_type_id
                JOIN subscriptions s ON s.channel_id = ch.id
                WHERE s.follower_channel_id = $1
            `, [userId]
            );

            return NotifEntity.fromDbRows(res.rows)
        } catch (error) {
            throw new Error(`Error getNotifsByUserId repository: ${error}`);
        }
    }
}