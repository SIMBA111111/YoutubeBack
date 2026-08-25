import { TSort, TVideoAgeFilter, TVideoTypeFilter } from "./video.consts"
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
}

export interface IVideoService {
    getVideos: (tagName: string, isShort: boolean, channelData: string | null, offset: number, limit: number) => Promise<VideoEntity[]>
    getVideoListBySubs: (followerId: string, offset: number, limit: number, onlyShorts: boolean, onlyFull: boolean) => Promise<VideoEntity[]>
    getVideoListByOwnerUsername: (channelUsername: string, filter: TVideoAgeFilter, isShort: boolean, offset: number, limit: number) => Promise<VideoEntity[]>
}
