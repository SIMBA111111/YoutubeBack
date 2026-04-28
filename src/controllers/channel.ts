import { Request, Response } from 'express';
import {getChannelsByUser} from '../repositories/channel'

export const getMyChannels = async (req: Request, res: Response) => {
    console.log('getMyChannels');
    try {
        const data = JSON.parse(req.cookies.channelData || '')
        const { offset, limit } = req.query

        const channels = await getChannelsByUser(data.id, Number(offset) | 0, Number(limit) || 20)
        if(!channels)
            return res.json({result: `Нет ни одной подписки`})

        const result = {
            channels: channels,
            total: channels.length
        }

        return res.status(200).json(result)    
    } catch (error) {
        console.error('Error getMyChannels: ', error);
        return res.status(500).json({ message: 'Internal server error getMyChannels'})    
    }
    
}