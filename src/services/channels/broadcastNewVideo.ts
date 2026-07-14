import { Response } from 'express'
import { pool } from '../../utils/pg'

export const broadcastNewVideo = async (
  activeConnections: Map<string, Set<IConnection>>,
  channelId: string,
  video: any
) => {
  console.log("broadcastNewVideo");
  try {
    const activeChannelIds = Array.from(activeConnections.keys());
    console.log("activeChannelIds: ", activeChannelIds);

    const subscribers = await pool.query(
      `
        SELECT * FROM subscriptions
        WHERE channel_id = $1 AND follower_channel_id = ANY($2)
        `,
      [channelId, activeChannelIds]
    );

    console.log("subscribers: ", subscribers);

    // Используем for...of вместо forEach для async операций
    for (const sub of subscribers.rows) {
      const connections = activeConnections.get(sub.follower_channel_id);
      //   console.log(`Соединения для ${sub.follower_channel_id}:`, connections);

      if (connections && connections.size > 0) {
        // Проходим по всем соединениям пользователя
        for (const connection of connections) {
          try {
            if (!connection.res.writableEnded && !connection.res.destroyed) {
              console.log(
                `Пробуем отправить уведомление через ${connection.id}!`
              );
              connection.res.write(
                `data: ${JSON.stringify({ type: "newVideo", data: video })}\n\n`
              );
              console.log(
                `✅ Уведомление отправлено к: ${sub.follower_channel_id} через ${connection.id}`
              );
            } else {
              console.log(
                `❌ Соединение ${connection.id} уже закрыто для ${sub.follower_channel_id}`
              );
              // Удаляем только это соединение, а не всех пользователей
              connections.delete(connection);
            }
          } catch (error) {
            console.error(`Ошибка при отправке через ${connection.id}:`, error);
            connections.delete(connection);
          }
        }

        // Если после очистки Set пуст - удаляем пользователя
        if (connections.size === 0) {
          activeConnections.delete(sub.follower_channel_id);
        }
      } else {
        console.log(`❌ Нет соединений для ${sub.follower_channel_id}`);
        console.log(
          "Доступные пользователи:",
          Array.from(activeConnections.keys())
        );
      }
    }
  } catch (error) {
    console.log("Error in broadcastNewVideo: ", error);
  }
};
