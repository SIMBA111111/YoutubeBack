export interface INotifExtendInfo {
    id: string
    viewed: boolean
    channelId: string
    videoId: string
    notifTypeId: string
    createdDate: string 
    updatedDate: string
    videoName: string
    isShort: boolean 
    thumbnailUrl: string
    channelName: string
    avatarUrl: string
}

export const mapNotifExtendInfo = (data: any[]): INotifExtendInfo[] => {
    return data.map(i => ({
        avatarUrl: i.avatar_url,
        channelId: i.channel_id,
        channelName: i.channel_name,
        createdDate: i.created_date,
        id: i.id,
        isShort: i.is_short,
        notifTypeId: i.notif_type_id,
        thumbnailUrl: i.thumbnail_url,
        updatedDate: i.updated_date,
        videoId: i.video_id,
        videoName: i.video_name,
        viewed: i.viewed
    }))
}