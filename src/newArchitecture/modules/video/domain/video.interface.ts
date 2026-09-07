import { TIncOrDesc } from "../../../shared/types"
import { IStatisticVideoDto } from "../../statistic/domain/statistic.dtos"
import { VideoStatisticEntity } from "../../statistic/domain/statistic.entity"
import { TSort, TVideoAgeFilter, TVideoTypeFilter } from "./video.consts"
import { IgetVideoByIdServiceDto, IUpdateMarkVideoDto, IUpdateViewVideoDto, IVideoAnalyticDto } from "./video.dtos"
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
    getVideoStatByUser: (videoId: string, userId: string) => Promise<VideoStatisticEntity>
    updateVideoLikes: (videoId: string, operation: TIncOrDesc) => Promise<number>
    updateVideoDislikes: (videoId: string, operation: TIncOrDesc) => Promise<number>
    updateVideoById: (
        videoId: string,
        hashtags: any[],
        tags: any[],
        playlistIds: any[],
        videoName: string,
        videoDescription: string,
        thumbnailUrl: string
    ) => Promise<VideoEntity>
    deleteVideoById: (videoId: string) => Promise<VideoEntity>
    createVideo: (
        videoId: string,
        videoMp4: string,
        videoName: string,
        videoDescription: string,
        masterM3U8Url: string,
        thumbnailUrl: string,
        previewUrl: string,
        fragments: [],
        channelId: string,
        duration: number,
        videoAccess: string,
        hashTags: [],
        tags: [],
        playlistIds: [],
        isShort: boolean,
        averageColor: string,
    ) => Promise<VideoEntity>
}

export interface IVideoService {
    getVideos: (tagName: string, isShort: boolean, channelData: string | null, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideoListBySubs: (followerId: string, offset: number, limit: number, onlyShorts: boolean, onlyFull: boolean) => Promise<VideoEntity[]>
    getVideoById: (videoId: string, followerId: string) => Promise<IgetVideoByIdServiceDto | string>
    updateViewVideo: (videoId: string, viewerId: string) => Promise<IUpdateViewVideoDto | string>
    getVideoAnalytics: (videoId: string, dateRange: string) => Promise<IStatisticVideoDto>
    updateMarkVideo: (videoId: string, userId: string, isLiked: boolean, isDisliked: boolean) => Promise<IUpdateMarkVideoDto>
    updateVideo: (videoId: string, iconPreview: string, videoName: string, videoDescription: string, hashTags: [], tags: [], playlistIds: []) => Promise<VideoEntity>
    deleteVideoService: (videoId: string) => Promise<boolean>
    createVideo: (
        videoId: string,
        channelId: string,
        videoName: string,
        videoDescription: string,
        videoPreview: string,
        playlistIds: [],
        fragments: [],
        videoAccess: string,
        hashTags: [],
        tags: [],
        isShort: boolean,
        files: Record<string, Express.Multer.File[]>
    ) => Promise<VideoEntity>
}
