import { Request, Response } from 'express';
import {createChannel, usernameIsExist, emailIsExist} from '../repositories/auth'
import {cryptPassword, checkPassword, createToken} from '../services/auth-service'


export const login = async (req: Request, res: Response) => {
    if (req.method === 'POST') {
        const data = req.body

        const user = await usernameIsExist(data.username)
        if(!user)
            return res.json({result: `Юзера с username ${data.username} не существует`})

        const isAprovePassword = await checkPassword(data.password, user)

        if(!isAprovePassword) 
            return res.status(401).json({result: 'Неверный пароль'})

        const token = await createToken(user.id)

        res.cookie('channelData', JSON.stringify({
            id: user.id, 
            name: user.name, 
            username: user.username,
            avatarUrl: user.avatar_url, 
            email: user.email
        }))
        res.cookie('jwt', token.token, {
            // httpOnly:  true,
            // secure: true // только для https
        })
        return res.status(201).json({ message: 'Авторизация успешна'})
    } else {
        res.status(405).json({ message: 'Method Not Allowed' })
    }
}

export const register = async (req: Request, res: Response) => {
    if (req.method === 'POST') {
        const data = req.body
        
        const username = await usernameIsExist(data.username)
        if(username)
            return res.json({result: `Username ${data.username} занят`})
        
        const email = await emailIsExist(data.email)
        if (email) 
            return res.json({result: `Email ${data.email} занят`})

        const hashedPassword = await cryptPassword(data.password)
        const createdChannel = await createChannel(data.username, data.name, hashedPassword, data.email)

        if(createdChannel) {
            const token = await createToken(createdChannel.id)
            res.cookie('channelData', JSON.stringify({
                id: createdChannel.id, 
                name: createdChannel.id, 
                username: createdChannel.username,
                avatarUrl: createdChannel.avatar_url, 
                email: createdChannel.email
            }))
            res.cookie('jwt', token.token, {
                httpOnly:  true,
                // secure: true // только для https
            })
            return res.status(201).json({ message: 'Успешная регистрация!'})
        } else {
            res.status(503).json({ message: 'Ошибка регистрации', result: false })
        }

        // res.status(201).json({ message: 'Успешно', result: createdChannel })
    } else {
        res.status(405).json({ message: 'Method Not Allowed' })
    }
}

export const logout = async (req: Request, res: Response) => {
    if (req.method === 'POST') {
        const channelId = req.cookies.channelId
        const jwt = req.cookies.jwt

        console.log('channelId = ', channelId);
        console.log('jwt = ', jwt);
        
        
        res.status(201).json({ message: 'Успешно'})
    } else {
        res.status(405).json({ message: 'Method Not Allowed' })
    }
}

// export const CheckToken = async (req, res) => {
//     try {
//         if (req.method === 'POST') {
//             const data = req.body
            


//         } else {
//             res.status(405).json({ message: 'Method Not Allowed' })
//         }
//     } catch (error) {
//         throw new Error(`Error CheckToken controller: `, error)
//     }
// }