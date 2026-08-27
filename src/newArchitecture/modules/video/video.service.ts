import { ChannelEntity } from "../channel/domain/channel.entity";
import { IChannelRepository } from "../channel/domain/channel.interface";
import { IStatisticRepository } from "../statistic/domain/statistic.interface";
import { ISubscriptionRepository } from "../subscription/domain/subscription.interface";
import { TVideoTypeFilter, VIDEO_TYPE_FILTER } from "./domain/video.consts";
import { IgetVideoByIdServiceDto, IUpdateViewVideoDto } from "./domain/video.dtos";
import { VideoEntity } from "./domain/video.entity";
import { IVideoRepository, IVideoService } from "./domain/video.interface";

export class VideoService implements IVideoService{
    constructor(
        private videoRepository: IVideoRepository,
        private channelRepository: IChannelRepository,
        private statisticRepository: IStatisticRepository,
        private subscriptionRepository: ISubscriptionRepository 
    ) {}

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

    async getVideoById(videoId: string, followerId: string): Promise<IgetVideoByIdServiceDto | string> {
        const video = await this.videoRepository.getVideoById(videoId as string);
    
        if (!video) {
            return 'Video not found'
        }
    
        const channel = await this.channelRepository.getChannelById(followerId);
    
        let subscriptionData = null;
        let videoStatData = null;
    
        if (channel instanceof ChannelEntity) {
            subscriptionData = await this.subscriptionRepository.getSubscriptionDataByFollowerId(channel.id, followerId);
            videoStatData = await this.statisticRepository.getVideoStatisticByFollowerId(video.id, followerId);
        }
    
        const result = {
            video: video,
            videoOwnerChannel: channel,
            subscriptionData: subscriptionData,
            videoStatData: videoStatData,
        }

        return result
    }

    async updateViewVideo(videoId: string, viewerId: string): Promise<IUpdateViewVideoDto | string> {
        const video = await this.videoRepository.getVideoById(videoId);

        if (!video) {
            return "Video not found"
        }

        const isUpdated = await this.videoRepository.updateVideoViewsById(videoId as string);

        // новая таблица для отслеживания просмотров для статистики 
        await this.videoRepository.updateVideoViewsForAnal( 
            videoId as string,
            viewerId !== 'undefined' ? viewerId : '00000000-0000-0000-0000-000000000000',
        )

        if (viewerId) {
            const statRes = await this.statisticRepository.getVideoStatisticByFollowerId(
                videoId,
                viewerId
            );

            if (statRes) {
                console.log("ОБНОВЛЯЕМ");

                await this.statisticRepository.updateVideoStatViewsCount(videoId, viewerId);
            } else {
                console.log("СОЗДАЕМ");
                await this.statisticRepository.createVideoStatForUser(
                    videoId,
                    viewerId,
                );
            }
        }

        return {success: 'video view updated successful'}
    }
}