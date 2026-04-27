import {pool} from '../utils/pg'

export const usernameIsExist = async (username: string) => {
    try {
        const res = await pool.query('SELECT * FROM channels WHERE username=$1', [username])
        if (res.rows[0]) 
            return res.rows[0]

        return false
    } catch (error) {
        throw new Error(`Error usernameIsExist repository: ${error}`)
    }
}

export const emailIsExist = async (email : string) => {
    try {
        const res = await pool.query('SELECT * FROM channels WHERE email=$1', [email])
        if (res.rows[0]) 
            return res.rows[0]

        return false
    } catch (error) {
        throw new Error(`Error emailIsExist repository: ${error}`)
    }
}

export const createChannel = async (
    username: string, 
    name: string, 
    hashedPassword: string, 
    email: string, 
) => {
    try {
        const res = await pool.query('INSERT INTO channels (username, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, name, hashedPassword, email]
        )
        const createdChannel = res.rows[0]
        return createdChannel 
    } catch (error) {
        throw new Error(`Error createChannel: ${error}`)
    }
}

export const createTokenRepo = async (channelId: string, token: string) => {
    try {
        const res = await pool.query('INSERT INTO tokens (channel_id, token) VALUES ($1, $2) RETURNING *',
            [channelId, token]
        )
        const createdToken = res.rows[0]
        return createdToken
    } catch (error) {
        throw new Error(`Error createToken: ${error}`)
    }
}