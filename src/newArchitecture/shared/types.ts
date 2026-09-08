export interface ChannelData {
    id: string, 
    name: string, 
    username: string,
    avatarUrl: string, 
    email: string
    token?: string
}

export enum INC_OR_DESC {
    DESC = 'DESC',
    INC = 'INC'
}

export type TIncOrDesc = keyof typeof INC_OR_DESC

export enum NOTIF_TYPES {
    NEW_VIDEO = 'NEW_VIDEO',
    NEW_COMMENT = 'NEW_COMMENT',
    NEW_LIKE = 'NEW_LIKE',
    NEW_FOLLOWER = 'NEW_FOLLOWER'
}

export interface INotif {
    id: string
    name: string
}