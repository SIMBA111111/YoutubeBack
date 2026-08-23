import { VideoEntity } from "./video.entity";
import { IVideoRepository, IVideoService } from "./video.interface";

export class VideoService implements IVideoService{
    constructor(private videoRepository: IVideoRepository) {}

    async getVideos(
        tagName: string | null, 
        channelData: string | null, 
        offset: number, 
        limit: number
    ): Promise<VideoEntity[]> {

        const parsedChannelData = JSON.parse(channelData || '')
            
        let response;

        if (tagName === "fresh") {
            response = await getOrderedVideoList("DESC", offset, limit);
        } else if (tagName === "newForMe" && channelId) {
            response = await getVideosFollowedChannels(channelId, offset, limit);
        } else if (tagName === "viewed" && channelId) {
            response = await getViewedVideosByChannelId(channelId, offset, limit);
        } else if (tagName === "all" || !tagName) {
            response = await getVideoList(offset, limit);
        } else {
            response = await getVideoListByTag(tag?.id);
        }

    }
}