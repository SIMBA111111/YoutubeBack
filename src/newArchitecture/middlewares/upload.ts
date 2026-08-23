// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            videoId?: string;
        }
    }
}

const baseDir = path.join(process.cwd(), 'public', 'videos');

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

let currentVideoId: string | null = null;

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (!currentVideoId) {
            currentVideoId = crypto.randomUUID();
            req.videoId = currentVideoId;
        }

        const videoDir = path.join(baseDir, currentVideoId);

        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
        }

        let subDir = 'video';
        if (file.fieldname === 'videoPreview') {
            subDir = 'thumbnail';
        }

        const fullDir = path.join(videoDir, subDir);

        if (!fs.existsSync(fullDir)) {
            fs.mkdirSync(fullDir, { recursive: true });
        }

        cb(null, fullDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    currentVideoId = null;
    upload.fields([
        { name: 'videoFile', maxCount: 1 },
        { name: 'videoPreview', maxCount: 1 },
    ])(req, res, next);
};

export { uploadMiddleware as upload };