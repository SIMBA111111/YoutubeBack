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