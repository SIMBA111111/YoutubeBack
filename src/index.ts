// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import routesVideo from './routes/videos';
import {router as RouterAuth} from './routes/auth'
import {router as RouterChannel} from './routes/channel'
import {router as RouterComments} from './routes/comments'
import {router as RouterPosts} from './routes/posts'
import {router as RouterPlaylists} from './routes/playlists'
import {router as RouterMe} from './routes/me'
import { authCheck } from './middleware';


const port = 8080;

const app = express();

// Логирование всех запросов (ПЕРВЫМ)
app.use((req, res, next) => {
    // console.log(`${req.method} ${req.url}`);
    next();
});

// CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
}));

// Парсеры
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(authCheck);
app.use(express.static('public'));

// Маршруты (ПОСЛЕ всех middleware)
app.use('/api', routesVideo);
app.use('/api', RouterChannel);
app.use('/api', RouterComments);
app.use('/api', RouterPosts);
app.use('/api', RouterPlaylists);
app.use('/api', RouterMe);
app.use('/api/auth', RouterAuth);

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});