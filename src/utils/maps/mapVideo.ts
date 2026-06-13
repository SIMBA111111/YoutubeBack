import { ITag } from "./mapTag"


export interface IFragment{
    start: number;
    end: number;
    title: string
}

interface IVideo {
    id: string
    name: string
    videoHash: string
    duration: number
    previewUrl: string
    videoPreviewUrl: string
    videoMp4Url: string
    viewersCount: number
    videoDescription: string
    hashtags: string
    likeCount: number
    dislikeCount: number
    commentsCount: number
    videoAccess: string
    masterM3u8Url: string
    playlistIds: string[]
    dateviewed: string
    channel: {
        id: string
        username: string
        name?: string
        avatarUrl: string
    }
    fragments?: IFragment[]
    datePublication?: string
    tags?: ITag[]
    isShort: boolean
}

export const mapToIVideo = (video: any): IVideo => {
    return {
        id: video.id,
        name: video.name,
        videoHash: video.video_hash,
        duration: video.duration,
        previewUrl: video.thumbnail_url,
        videoPreviewUrl: video.video_preview_url,
        videoMp4Url: video.video_mp4_url,
        viewersCount: video.viewers_count,
        likeCount: video.likes_count || 0,
        dislikeCount: video.dislikes_count || 0,
        commentsCount: video.comments_count || 0,
        videoAccess: video.video_access || '',
        datePublication: video.date_publication,
        isShort: video.is_short,
        tags: video.tags,
        videoDescription: video.description,
        hashtags: video.hashtags,
        playlistIds: video.playlistids,
        subscribersCount: video.subscribers_count,
        masterM3u8Url: video.master_m3u8_url,
        dateviewed: video.dateviewed || '',
        channel: {
            id: video.channelid || '',
            name: video?.channelname || '',
            username: video?.channelusername ||  '',
            avatarUrl: video?.channelavatarurl || ''
        },
        fragments: video?.fragments?.length > 0 ? video.fragments.map((f: any) => { return {
            start: f.start_time,
            end: f.end_time,
            title: f.name,
        }}) : []
    };
};

export const mapVideosToIVideo = (videos: any[]): IVideo[] => {
    return videos.map(video => mapToIVideo(video));
};