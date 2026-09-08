import { Request, Response } from "express";
import express from 'express'

const router = express.Router();

export const activeNotifConnections = new Map();
router.get('/notif-event/:userId', async (req: Request, res: Response) => {
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
});
