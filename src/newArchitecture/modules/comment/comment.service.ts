import { ICommentService, IGetRepliesCommentResponse } from "./comment.interface";
import { CommentRepository } from './comment.repository'

export class СommentService implements ICommentService {
    constructor(private commentRepository: CommentRepository) {}

    async getRepliesComment(parentCommentId: string, userId: string, offset: number, limit: number): Promise<IGetRepliesCommentResponse> {
        const repliesComments = await this.commentRepository.getRepliesComment(parentCommentId, userId, offset, limit)
        const repliesCommentsCount = await this.commentRepository.getRepliesCommentCount(parentCommentId)
        
        return {
            comments: repliesComments,
            commentsCount: repliesCommentsCount,
        }; 
    }
}