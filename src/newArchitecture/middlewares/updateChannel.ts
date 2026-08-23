// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const baseDir = path.join(process.cwd(), 'public', 'channels');

// Создаем базовую директорию если её нет
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

// Функция для генерации уникального имени файла
const generateUniqueFilename = (originalname: string): string => {
    const ext = path.extname(originalname);
    const name = path.basename(originalname, ext);
    const hash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    return `${name}-${timestamp}-${hash}${ext}`;
};

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const avatarsDir = path.join(baseDir, 'avatars');
        const bannersDir = path.join(baseDir, 'banners');

        // Создаем директории если их нет
        if (!fs.existsSync(bannersDir)) {
            fs.mkdirSync(bannersDir, { recursive: true });
        }

        if (!fs.existsSync(avatarsDir)) {
            fs.mkdirSync(avatarsDir, { recursive: true });
        }

        // Определяем директорию в зависимости от поля
        let destinationDir: string;
        if (file.fieldname === 'avatarUrl') {
            destinationDir = avatarsDir;
        } else if (file.fieldname === 'bannerUrl') {
            destinationDir = bannersDir;
        } else {
            // По умолчанию - корневая директория
            destinationDir = baseDir;
        }

        cb(null, destinationDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // Генерируем уникальное имя файла
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
    },
});

// Фильтр файлов (проверка MIME типов)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат файла. Разрешены: JPEG, PNG, GIF, WEBP, SVG'));
    }
};

// Настройка multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 6 * 1024 * 1024, // 6 MB для баннера
        files: 2 // максимум 2 файла
    }
});

// Middleware для загрузки файлов
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.fields([
        { name: 'bannerUrl', maxCount: 1 },
        { name: 'avatarUrl', maxCount: 1 },
    ])(req, res, (err: any) => {
        if (err) {
            // Обработка ошибок multer
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({ error: 'Неожиданное поле файла' });
                }
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }

       if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            Object.keys(files).forEach(fieldName => {
                if (files[fieldName] && files[fieldName].length > 0) {
                    const file = files[fieldName][0];
                    const folder = fieldName === 'avatarUrl' ? 'avatars' : 'banners';
                    req.body[fieldName] = `http://localhost:8080/channels/${folder}/${file.filename}`;
                }
            });
        }

        next();
    });
};

// Middleware для одиночного файла (если нужно)
const uploadSingle = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, (err: any) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({ error: err.message });
                }
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
};

// Функция для удаления старого файла
const deleteOldFile = (filePath: string): void => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Ошибка при удалении файла ${filePath}:`, err);
            } else {
                console.log(`Файл удален: ${filePath}`);
            }
        });
    }
};

// Функция для получения пути к файлу
const getFilePath = (filename: string, type: 'avatar' | 'banner'): string => {
    const dir = type === 'avatar' ? 'avatars' : 'banners';
    return path.join(baseDir, dir, filename);
};

// Middleware для обработки обновления канала с удалением старых файлов
const updateChannelWithCleanup = (req: Request, res: Response, next: NextFunction) => {
    upload.fields([
        { name: 'bannerUrl', maxCount: 1 },
        { name: 'avatarUrl', maxCount: 1 },
    ])(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }

        // Получаем старые URL из тела запроса
        const oldBannerUrl = req.body.oldBannerUrl;
        const oldAvatarUrl = req.body.oldAvatarUrl;

        // Удаляем старые файлы если они есть
        if (oldBannerUrl) {
            const oldBannerPath = path.join(process.cwd(), 'public', oldBannerUrl);
            deleteOldFile(oldBannerPath);
        }

        if (oldAvatarUrl) {
            const oldAvatarPath = path.join(process.cwd(), 'public', oldAvatarUrl);
            deleteOldFile(oldAvatarPath);
        }

        next();
    });
};

export { 
    uploadMiddleware as updateChannel,
    uploadSingle,
    deleteOldFile,
    getFilePath,
    updateChannelWithCleanup
};