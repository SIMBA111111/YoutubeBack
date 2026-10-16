import { ChannelData } from "../../../shared/types"
import { ChannelEntity, IChannelEntity } from "../../channel/domain/channel.entity"
import { TCryptedPassword, TToken } from "./auth.dtos"

export interface IAuthRepository {
    usernameIsExist: (username: string) => Promise<ChannelEntity>
    emailIsExist: (email : string) => Promise<ChannelEntity>
    createChannel: ( username: string, name: string, hashedPassword: string, email: string ) => Promise<ChannelEntity>
    createTokenRepo: (channelId: string, token: string) => Promise<TToken>
    deleteToken: (channelId: string, token: string) => Promise<boolean>
}

export interface IAuthService {
    login: (username: string, password: string) => Promise<ChannelData | string>
    register: (username: string, email: string, password: string, name: string) => Promise<ChannelData | string>
}