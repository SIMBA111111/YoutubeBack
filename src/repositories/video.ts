import {pool} from '../utils/pg'

export const getTagById = async (tagId: string) => {
    try {
        const res = await pool.query('SELECT * FROM tags WHERE id=$1', [tagId])
        if (res.rows[0]) 
            return res.rows[0]

        return false
    } catch (error) {
        throw new Error(`Error getVideoById repository: ${error}`)
    }
}

export const getVideoByHash = async (videoHash: string) => {
    try {
        const res = await pool.query('SELECT * FROM videos WHERE video_hash = $1', [videoHash])
        if (res.rows[0]) 
            return res.rows[0]

        return false
    } catch (error) {
        throw new Error(`Error getVideoByHash repository: ${error}`)
    }
}