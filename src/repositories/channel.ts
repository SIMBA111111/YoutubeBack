import {pool} from '../utils/pg'

export const getChannelByUsername = async (username: string) => {
    try {
        const res = await pool.query('SELECT * FROM channels WHERE username=$1', [username])
        if (res.rows[0]) 
            return res.rows[0]

        return false
    } catch (error) {
        throw new Error(`Error usernameIsExist repository: ${error}`)
    }
}