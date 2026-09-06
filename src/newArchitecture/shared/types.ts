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