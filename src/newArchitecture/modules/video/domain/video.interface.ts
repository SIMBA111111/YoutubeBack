import { TSort, TVideoAgeFilter, TVideoTypeFilter } from "./video.consts"
import { IgetVideoByIdServiceDto, IUpdateViewVideoDto } from "./video.dtos"
import { IVideoEntity, TagEntity, VideoEntity } from "./video.entity"

export interface IVideoRepository {
    getAllTags: () => Promise<TagEntity[]>
    getTagsByName: (tagName: string) => Promise<TagEntity>
    getOrderedVideoList: (sortByDatePublication: TSort, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideosByFollowedChannels: (channelId: string, offset: number, limit: number) => Promise<VideoEntity[]>
    getViewedVideos: (channelId: string, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideoList: (offset: number, limit: number, isShort: boolean | null) => Promise<VideoEntity[]>
    getVideoListByTag: (tagId: string, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideoListByName: (VideoName: string, offset: number, limit: number, isFullObj: boolean) => Promise<VideoEntity[]>
    getVideoListBySubs: (followerId: string, offset: number, limit: number, videoTypeFiler: TVideoTypeFilter) => Promise<VideoEntity[]>
    getVideoListByOwnerUsername: (channelUsername: string, filter: TVideoAgeFilter, isShort: boolean, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideoById: (videoId: string) => Promise<VideoEntity>
    getRecommendedVideos: (videoId: string, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideosIds: (offset: number, limit: number, isShortVideo: boolean) => Promise<string[]>
    updateVideoViewsById: (videoId: string) => Promise<Boolean>
    updateVideoViewsForAnal: (videoId: string, viewerId: string) => Promise<boolean>
}

export interface IVideoService {
    getVideos: (tagName: string, isShort: boolean, channelData: string | null, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideoListBySubs: (followerId: string, offset: number, limit: number, onlyShorts: boolean, onlyFull: boolean) => Promise<VideoEntity[]>
    getVideoById: (videoId: string, followerId: string) => Promise<IgetVideoByIdServiceDto | string>
    updateViewVideo: (videoId: string, viewerId: string) => Promise<IUpdateViewVideoDto | string>
    getVideoAnalytics(videoId: string, dateRange: string) => Promise<VideoAnalyticDto>
}
