import { NextFunction, Request, Response } from "express";

// middleware/auth.ts
export const authCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cookies.channelData || req.cookies.channelData === '') {
      console.log('отмена');
      
      return res.status(401).json({ error: 'Not authorized' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authorization data' });
  }
};