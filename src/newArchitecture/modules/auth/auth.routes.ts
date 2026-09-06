// routes/videos.js
import express, { Request, Response } from 'express'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.services'
import { ApiResponseDTO } from '../../shared/dtos/response.dto'
import { getStringParam } from '../../shared/utils/paramsParse'

export const router = express.Router()

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(
                ApiResponseDTO.error('Username and password are required')
            );
        }

        const userData = await authService.login(username, password);

        if (typeof userData === 'string') {
            return res.status(401).json(ApiResponseDTO.error(userData));
        }

        res.cookie('channelData', JSON.stringify({
            id: userData.id,
            name: userData.name,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
            email: userData.email
        }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        res.cookie('jwt', userData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.status(200).json(
            ApiResponseDTO.success({ 
                id: userData.id,
                name: userData.name,
                username: userData.username
            })
        );

    } catch (error: any) {
        console.error('Login error:', error);
        
        return res.status(500).json(
            ApiResponseDTO.error(error.message || 'Internal server error')
        );
    }
});


router.post('/register', async (req: Request, res: Response) => {
    try {
        const username = getStringParam(req.body.username)
        const email = getStringParam(req.body.email)
        const password = getStringParam(req.body.password)
        const name = getStringParam(req.body.name)

        const userData = await authService.register(username, email, password, name)

        if (typeof userData === 'string') {
            return res.status(401).json(ApiResponseDTO.error(userData));
        }

        res.cookie('channelData', JSON.stringify({
            id: userData.id,
            name: userData.name,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
            email: userData.email
        }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        res.cookie('jwt', userData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.status(200).json(
            ApiResponseDTO.success({ 
                id: userData.id,
                name: userData.name,
                username: userData.username
            })
        );

    } catch (error: any) {
        console.error('Login error:', error);
        
        return res.status(500).json(
            ApiResponseDTO.error(error.message || 'Internal server error')
        );
    }
})


router.post('/logout', async (req: Request, res: Response) => {
    try {
        const channelId = getStringParam(req.cookies.channelId)
        const jwt = getStringParam(req.cookies.jwt)

        const isLogouted = authRepository.deleteToken(channelId, jwt)

        res.clearCookie('channelData')
        res.clearCookie('token')
        
    return res.status(200).json(ApiResponseDTO.success(isLogouted))
  } catch (error: any) {
    return res.status(500).json(ApiResponseDTO.error(error));
  }
})