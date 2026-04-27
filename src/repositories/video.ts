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