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