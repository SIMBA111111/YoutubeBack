// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

import routesVideo from './routes/videos';
import {router as RouterAuth} from './routes/auth'
import cookieParser from 'cookie-parser';


const port = 8080;

const app = express();

// Логирование всех запросов (ПЕРВЫМ)
app.use((req, res, next) => {
    // console.log(`${req.method} ${req.url}`);
    next();
});

// CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Парсеры
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Маршруты (ПОСЛЕ всех middleware)
app.use('/api', routesVideo);
app.use('/api/auth', RouterAuth);

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});