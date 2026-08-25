import { TVideoTypeFilter, VIDEO_TYPE_FILTER } from "./domain/video.consts";
import { VideoEntity } from "./domain/video.entity";
import { IVideoRepository, IVideoService } from "./domain/video.interface";

export class VideoService implements IVideoService{
    constructor(private videoRepository: IVideoRepository) {}

    async getVideos(
        tagName: string, 
        isShort: boolean, 
        channelData: string | null, 
        offset: number, 
        limit: number
    ): Promise<VideoEntity[]> {

        const parsedChannelData = JSON.parse(channelData || '')

        const tag = await this.videoRepository.getTagsByName(tagName)

        let response;

        if (tagName === "fresh") {
            response = await this.videoRepository.getOrderedVideoList("DESC", offset, limit);
        } else if (tagName === "newForMe" && parsedChannelData.id) {
            response = await this.videoRepository.getVideosByFollowedChannels(parsedChannelData.id, offset, limit);
        } else if (tagName === "viewed" && parsedChannelData.id) {
            response = await this.videoRepository.getViewedVideos(parsedChannelData.id, offset, limit);
        } else if (tagName === "all" || !tagName) {
            response = await this.videoRepository.getVideoList(offset, limit, isShort);
        } else {
            response = await this.videoRepository.getVideoListByTag(tag.id, offset, limit);
        }
        
        return response
    }

    async getVideoListBySubs(followerId: string, offset: number, limit: number, onlyShorts: boolean, onlyFull: boolean): Promise<VideoEntity[]> {
        
        let videoTypeFilter: TVideoTypeFilter

        if(onlyShorts === onlyFull) {
            videoTypeFilter = VIDEO_TYPE_FILTER.ALL
        } else {
            onlyShorts ? videoTypeFilter = VIDEO_TYPE_FILTER.ONLY_SHORTS : videoTypeFilter = VIDEO_TYPE_FILTER.ONLY_FULL 
        }

        const videos = await this.videoRepository.getVideoListBySubs(followerId, offset, limit, videoTypeFilter)
        
        return videos
    }
}