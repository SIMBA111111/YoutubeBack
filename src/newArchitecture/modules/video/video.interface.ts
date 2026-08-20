
export interface IVideoRepository {
    updateVideoCommentCount: (videoId: string) => Promise<number>
}


export interface IVideosService {
}
