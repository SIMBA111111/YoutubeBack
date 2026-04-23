// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

import routesVideo from './routes/videos';
import {router as RouterAuth} from './routes/routes-auth'
import cookieParser from 'cookie-parser';


const app = express();
const port = 8080;

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api', routesVideo);
app.use('/api/auth', RouterAuth)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
