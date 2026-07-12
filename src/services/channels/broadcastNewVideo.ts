import { Response } from 'express'
import { pool } from '../../utils/pg'

export const broadcastNewVideo = async (activeConnections: Map<string, Response>, channelId: string, video: any) => {
    console.log('broadcastNewVideo');
    try {
        
        const activeChannelIds = Array.from(activeConnections.keys());
        
        console.log('activeChannelIds: ', activeChannelIds);

        const subscribers = await pool.query(`
            SELECT * FROM subscriptions
            WHERE channel_id = $1 AND follower_channel_id = ANY($2)
        `, [channelId, activeChannelIds])

        console.log('subscribers: ', subscribers);

        subscribers.rows.forEach((sub, index) => {
            const conn = activeConnections.get(sub.follower_channel_id)
            console.log('Соединения получены');

            if (conn) {
                // ✅ Правильно: conn это сам Response объект
                if (!conn.writableEnded && !conn.destroyed) {
                    try {
                        console.log('Пробуйем отправить уведомление!!!!!!!!!');
                        conn.write(`data: ${JSON.stringify({type: 'newVideo', data: video})}\n\n`);
                        console.log(`Уведомление отправлено к: ${sub.follower_channel_id}`);
                    } catch (error) {
                        console.error(`Ошибка при отправке:`, error);
                        activeConnections.delete(sub.follower_channel_id);
                    }
                } else {
                    console.log(`❌ Соединение уже закрыто для ${sub.follower_channel_id}`);
                    activeConnections.delete(sub.follower_channel_id);
                }
            } else {
                console.log(`❌ Нет соединения для ${sub.follower_channel_id}`);
                console.log('Доступные соединения:', Array.from(activeConnections.keys()));
            }
        })
    } catch (error) {
        console.log('Error in broadcastNewVideo: ', error);
            
    }
 
}