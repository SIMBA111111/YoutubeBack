import { ITag } from "./mapTag"

interface IVideo {
    id: string
    name: string
    videoHash: string
    duration: number
    previewUrl: string
    videoPreviewUrl: string
    viewersCount: number
    videoDescription: string
    hashtags: string
    likeCount: number
    dislikeCount: number
    channel: {
        id: string
        username: string
        avatarUrl: string
    }
    datePublication?: string
    tags?: ITag[]
    isShort: boolean
}

const mapToIVideo = (video: any): IVideo => {
    return {
        id: video.id,
        name: video.name,
        videoHash: video.video_hash,
        duration: video.duration,
        previewUrl: video.thumbnail_url,
        videoPreviewUrl: video.video_preview_url,
        viewersCount: video.viewers_count,
        likeCount: video.likes_count || 0,
        dislikeCount: video.dislikes_count || 0,
        datePublication: video.created_date,
        isShort: video.is_short,
        tags: video.tags,
        videoDescription: video.description,
        hashtags: video.hashtags,
        channel: {
            id: video.channelid || '',
            username: video?.channelusername ||  '',
            avatarUrl: video?.channelavatarurl || ''
        },
    };
};

export const mapVideosToIVideo = (videos: any[]): IVideo[] => {
    return videos.map(video => mapToIVideo(video));
};