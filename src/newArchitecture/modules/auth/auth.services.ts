import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IChannelEntity } from "../channel/domain/channel.entity";
import { TCryptedPassword, TToken } from "./domain/auth.dtos";
import { IAuthRepository, IAuthService } from './domain/auth.interface';
import { ChannelData } from '../../shared/types';

const SECRET_KEY = 'klsfjgdnkjlSDHBKjgfbskjdhfbksdbf'

export class AuthService implements IAuthService {
    constructor(private authRepository: IAuthRepository) {}

    async login(username: string, password: string): Promise<ChannelData | string> {
        const user = await this.authRepository.usernameIsExist(username)
        if(!user)
            return `Юзера с username ${username} не существует`

        const isAprovePassword = await bcrypt.compare(password, user.password)

        if(!isAprovePassword) 
            return 'Неверный пароль'

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '12h' })
        const createdToken = await this.authRepository.createTokenRepo(user.id, token)
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl || '',
            email: user.email,
            token: createdToken
        }
    }

    async register(username: string, email: string, password: string, name: string): Promise<ChannelData | string> {
        const channelEntityUsername = await this.authRepository.usernameIsExist(username)

        if(channelEntityUsername)
            return `Username ${username} занят`
        
        const channelEntityEmail = await this.authRepository.emailIsExist(email)
        if (channelEntityEmail) 
            return `Email ${email} занят`

        const saltRounds = 10; // число итераций соли
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const createdChannel = await this.authRepository.createChannel(username, name, hashedPassword, email)

        const loggedChannelData = await this.login(createdChannel.username, createdChannel.password)

        return loggedChannelData
    }
}