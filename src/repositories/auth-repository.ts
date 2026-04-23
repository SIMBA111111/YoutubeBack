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
    fullname: string, 
    username: string, 
    hashedPassword: string, 
    email: string, 
    phoneNumber: string
) => {
    try {
        const res = await pool.query('INSERT INTO channels (fullname, username, password, email, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [fullname, username, hashedPassword, email, phoneNumber]
        )
        const createdUser = res.rows[0]
        return createdUser 
    } catch (error) {
        throw new Error(`Error createUser: ${error}`)
    }
}

export const createTokenRepo = async (channelId: string, token: string) => {
    try {
        const res = await pool.query('INSERT INTO tokens (channelId, token) VALUES ($1, $2) RETURNING *',
            [channelId, token]
        )
        const createdToken = res.rows[0]
        return createdToken
    } catch (error) {
        throw new Error(`Error createToken: ${error}`)
    }
}