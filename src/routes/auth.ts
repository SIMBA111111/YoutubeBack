// routes/videos.js
import express from 'express'
import  { login, register, logout } from '../controllers/auth'

export const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
// router.post('/check-token', register)