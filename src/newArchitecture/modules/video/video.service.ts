import { TCommentFilters } from "./video.consts";
import { ICommentEntity } from "./video.entity";
import { ICommentService, IGetCommentResponse, IGetRepliesCommentResponse } from "./video.interface";
import { CommentRepository } from './video.repository'

export class СommentService implements ICommentService {
    constructor(private commentRepository: CommentRepository) {}

    async getRepliesComment(parentCommentId: string, userId: string, offset: number, limit: number): Promise<IGetRepliesCommentResponse> {
        const repliesComments = await this.commentRepository.getRepliesComment(parentCommentId, userId, offset, limit)
        const repliesCommentsCount = await this.commentRepository.getRepliesCommentCount(parentCommentId)
        
        return {
            comments: repliesComments,
            commentsCount: repliesCommentsCount,
        }
    }

    async getComments(videoId: string, userId: string, filter: TCommentFilters, offset: number, limit: number): Promise<IGetCommentResponse> {
        const videoComments = await this.commentRepository.getCommentsByVideoId(videoId, userId, filter, offset, limit)
        const videoCommentsCount = await this.commentRepository.getVideoCommentsCount(videoId)
        
        return {
            comments: videoComments,
            commentsCount: videoCommentsCount,
        } 
    }
}