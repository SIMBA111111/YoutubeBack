import { TagEntity, VideoEntity } from "./video.entity"

export interface IVideoRepository {
    getAllTags: () => Promise<TagEntity[]>
}

export interface IVideoService {
    getVideos: () => Promise<VideoEntity[]>
}
