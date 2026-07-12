import { Request, Response } from "express";


const connections = new Map();


export const videoProcess = (req: Request, res: Response) => {
    console.log('videoProcess - УСТАНАВЛИВАЕМ СОЕДИНЕНИЯ БЛЯТЬ');
    
  
    const userId = req.params.userId

    res.setHeader('Content-Type', 'text/event-stream');
    // res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Сохраняем connection
    connections.set(userId, res);
    
    console.log('videoProcess - ДОБАВЛЯЕМ ЕБЛАНА');


    // Отправляем начальное сообщение
    res.write(`data: ${JSON.stringify({ type: 'connected', progress: 0 })}\n\n`);

    // ✅ Добавляем keep-alive интервал
    const keepAliveInterval = setInterval(() => {
        if (res.writableEnded || res.destroyed) {
            clearInterval(keepAliveInterval);
            return;
        }
        // Отправляем пустой комментарий (не влияет на клиент)
        res.write(`: keep-alive\n\n`);
    }, 15000); // Каждые 15 секунд

    req.on('close', () => {
        console.log(`Соединение закрыто для ${userId}`);
        clearInterval(keepAliveInterval);
        connections.delete(userId); // ✅ Важно удалять!
    });
}


export async function sendProgress(userId: string, data: any) {
    const conn = connections.get(userId);
    
    console.log(`Отправка прогресса для ${userId}:`, data.progress);
    console.log(`Соединение существует:`, !!conn);
    
    if (conn) {
        // ✅ Правильно: conn это сам Response объект
        if (!conn.writableEnded && !conn.destroyed) {
            try {
                conn.write(`data: ${JSON.stringify(data)}\n\n`);
                console.log(`✅ Прогресс отправлен: ${data.progress}%`);
            } catch (error) {
                console.error(`Ошибка при отправке:`, error);
                connections.delete(userId);
            }
        } else {
            console.log(`❌ Соединение уже закрыто для ${userId}`);
            connections.delete(userId);
        }
    } else {
        console.log(`❌ Нет соединения для ${userId}`);
        console.log('Доступные соединения:', Array.from(connections.keys()));
    }
}


// Симуляция обработки файла с прогрессом
export async function processFile(userId: string) {
  console.log('processFile для ', userId);
  
  try {
    // Этап 1: Сохраняем файл (10%)
    sendProgress(userId, { progress: 10, stage: 'saving', message: 'Сохранение файла...' });
    await sleep(500);
    
    // Этап 2: Валидация (30%)
    sendProgress(userId, { progress: 30, stage: 'validation', message: 'Валидация данных...' });
    await sleep(800);
    
    // Этап 3: Обработка (60%)
    sendProgress(userId, { progress: 60, stage: 'processing', message: 'Обработка данных...' });
    await sleep(1000);
    
    // Этап 4: Сохранение в БД (90%)
    sendProgress(userId, { progress: 90, stage: 'saving_db', message: 'Сохранение в базу...' });
    await sleep(700);
    
    // Завершение (100%)
    sendProgress(userId, { progress: 100, stage: 'done', message: 'Готово!' });
    
  } catch (error) {
    sendProgress(userId, { progress: -1, stage: 'error', message: 'error.message' });
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export const activeNotifConnections = new Map();

export const notifEvent = async (req: Request, res: Response) => {
  console.log('📡 notifEvent called');
  
  try {
    const userId = req.params.userId as string;
    
    if (!userId) {
      console.error('❌ userId is required');
      return res.status(400).json({ error: "userId is required" });
    }
    
    console.log(`🔗 New SSE connection for user: ${userId}`);
    
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    };
    
    res.writeHead(200, headers);
    
    const connectionId = crypto.randomUUID();
    const connection = { 
      res, 
      id: connectionId,
      connectedAt: Date.now()
    };
    
    if (!activeNotifConnections.has(userId)) {
      activeNotifConnections.set(userId, new Set());
    }
    activeNotifConnections.get(userId).add(connection);
    
    console.log(`✅ SSE connected: user ${userId}, total: ${activeNotifConnections.get(userId).size}, id: ${connectionId}`);
    
    // Отправляем приветствие
    res.write(`data: ${JSON.stringify({ type: 'connected', userId, connectionId })}\n\n`);
    
    // Keep-alive реже
    const interval = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch (error) {
        console.error(`❌ Heartbeat failed for ${connectionId}:`, error);
        clearInterval(interval);
      }
    }, 15000);
    
    // ✅ Флаг, чтобы cleanup выполнился только один раз
    let isCleanedUp = false;
    
    const cleanup = () => {
      // ✅ Защита от двойного вызова
      if (isCleanedUp) {
        console.log(`⏭️ Cleanup already done for ${connectionId}, skipping`);
        return;
      }
      isCleanedUp = true;
      
      console.log(`🔚 Closing SSE connection: ${connectionId} for user ${userId}`);
      
      clearInterval(interval);
      
      const userConnections = activeNotifConnections.get(userId);
      if (userConnections) {
        for (const conn of userConnections) {
          if (conn.id === connectionId) {
            userConnections.delete(conn);
            console.log(`🗑️ Removed connection ${connectionId}`);
            break;
          }
        }
        
        if (userConnections.size === 0) {
          activeNotifConnections.delete(userId);
          console.log(`🗑️ Removed all connections for user ${userId}`);
        } else {
          console.log(`📊 Remaining connections for user ${userId}: ${userConnections.size}`);
        }
      }
      
      try {
        res.end();
      } catch (err) {
        // Игнорируем ошибки при закрытии
      }
    };
    
    // ✅ Подписываемся на оба события, но cleanup защищен от двойного вызова
    req.on('close', cleanup);
    req.on('error', (error) => {
      // Не выводим ECONNRESET как ошибку, это нормально
      console.log(`🔌 Client disconnected (ECONNRESET) for ${connectionId}`);
      cleanup();
    });
    
    res.flushHeaders();
    
  } catch (error) {
    console.error('❌ Error in notifEvent:', error);
    if (!res.headersSent) {
      return res.status(500).end();
    }
    res.end();
  }
};