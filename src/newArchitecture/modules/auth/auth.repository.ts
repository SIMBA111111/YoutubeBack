import { pool } from "../../shared/utils/pg";
import { ChannelEntity } from "../channel/domain/channel.entity";
import { TToken } from "./domain/auth.dtos";
import { IAuthRepository } from "./domain/auth.interface";

export class AuthRepository implements IAuthRepository {
    async createChannel(username: string, name: string, hashedPassword: string, email: string): Promise<ChannelEntity> {
        try {
            const res = await pool.query('INSERT INTO channels (username, name, password, email) VALUES ($1, $2, $3, $4) RETURNING *',
                [username, name, hashedPassword, email]
            )

            return ChannelEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error createChannel: ${error}`)
        }
    }
    
    async createTokenRepo(channelId: string, token: string): Promise<TToken> {
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
    
    async emailIsExist(email: string): Promise<ChannelEntity> {
        try {
            const res = await pool.query('SELECT * FROM channels WHERE email=$1', [email])

            return ChannelEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error emailIsExist repository: ${error}`)
        }
    }

    async usernameIsExist(username: string): Promise<ChannelEntity> {
        try {
            const res = await pool.query('SELECT FROM channels WHERE username=$1', [username])

            return ChannelEntity.fromDbRows(res.rows)[0]
        } catch (error) {
            throw new Error(`Error usernameIsExist repository: ${error}`)
        }
    }

    async deleteToken(channelId: string, token: string): Promise<boolean> {
        try {
            const res = await pool.query(
                'DELETE FROM tokens WHERE channel_id = $1 AND token = $2 RETURNING *',
                [channelId, token]
            );

            return res.rows.length > 0;
        } catch (error) {
            throw new Error(`Error deleteToken repository: ${error}`);
        }
    }
}