import { IStatisticRepository } from "../statistic/domain/statistic.interface";
import { IVideoRepository } from "../video/domain/video.interface";
import { COMMENTS_ACTIONS, TCommentFilters } from "./domain/comment.consts";
import { CommentEntity, ICommentEntity } from "./domain/comment.entity";
import { ICommentRepository, ICommentService, IGetCommentResponse, IGetRepliesCommentResponse, IMarkCommentResponse } from "./domain/comment.interface";
import { mapCommentStatistic } from "./domain/utils";

export class СommentService implements ICommentService {
    constructor(
        private commentRepository: ICommentRepository,
        private videoRepository: IVideoRepository, 
        private statisticRepository: IStatisticRepository 
    ) {}

    async getRepliesComment(parentCommentId: string, userId: string, offset: number, limit: number): Promise<IGetRepliesCommentResponse> {
        const repliesComments = await this.commentRepository.getRepliesComment(parentCommentId, userId, offset, limit)
        const repliesCommentsCount = await this.commentRepository.getRepliesCommentCount(parentCommentId)
        
        return {
            comments: repliesComments,
            commentsCount: repliesCommentsCount,
        }
    }

    async getComments(videoId: string, userId: string, filter: TCommentFilters, offset: number, limit: number): Promise<IGetCommentResponse | string> {
        try {
            const videoComments = await this.commentRepository.getCommentsByVideoId(videoId, filter, offset, limit)
            const videoCommentsCount = await this.commentRepository.getVideoCommentsCount(videoId)
            
            let commentsStatistic = null

            if (userId) {
                const res = await this.statisticRepository.getCommentsStatisticByUserId(userId, videoId)
                
                if (res) {
                    commentsStatistic = await mapCommentStatistic(res)
                }
            }

            return {
                comments: videoComments,
                commentsStatistic: commentsStatistic,
                commentsCount: videoCommentsCount,
            } 
            
        } catch (error) {
            console.log('ERROR getComments service: ', error);
            return error as string            
        }
    }

    async createComment(commentText: string, videoId: string, userId: string): Promise<CommentEntity | null> {
        const createdComment = await this.commentRepository.createComment(commentText, videoId, userId)

        if (createdComment) {
            await this.videoRepository.updateVideoCommentCount(videoId)
        }
        
        return createdComment
    }

    async markComment(commentId: string, userId: string, videoId: string, isLiked: boolean | null, isDisliked: boolean | null): Promise<IMarkCommentResponse | null> {
        try {
            const commentStat = await this.statisticRepository.getCommentStatisticByCommentId(commentId, userId)

            console.log('commentStat: ', commentStat)

            let updatedStatistic
            let updatedComment

            let oldLiked = false;
            let oldDisliked = false;

            if (commentStat && Object.keys(commentStat).length > 0) {
                oldLiked = commentStat.liked;
                oldDisliked = commentStat.disliked;
        
                updatedStatistic = await this.statisticRepository.updateCommentStatisticByUserId(commentId, userId, !!isLiked, !!isDisliked)
            } else {
                updatedStatistic = await this.statisticRepository.createCommentStatisticByUserId(videoId, commentId, userId, !!isLiked, !!isDisliked)
            }

            console.log('пизда');
            

            // Обновляем счетчики rjvvtynf
            // Сначала обрабатываем лайки
            if (oldLiked !== isLiked) {
                if (isLiked) {
                    updatedComment = await this.commentRepository.updateCommentLikeCount(commentId, COMMENTS_ACTIONS.INCREASE)
                } else {
                    updatedComment = await this.commentRepository.updateCommentLikeCount(commentId, COMMENTS_ACTIONS.DECREASE)
                }
            }
        
            // Обрабатываем дизлайки
            if (oldDisliked !== isDisliked) {
                if (isDisliked) {
                    updatedComment = await this.commentRepository.updateCommentDislikeCount(commentId, COMMENTS_ACTIONS.INCREASE)
                } else {
                    updatedComment = await this.commentRepository.updateCommentDislikeCount(commentId, COMMENTS_ACTIONS.DECREASE)
                }
            }

            console.log('хуй');
            

            if (!updatedComment || !updatedStatistic) {
                return null
            }

            return {
                updatedComment: updatedComment,
                updatedStatistic: updatedStatistic
            }       
        } catch (error) {
            console.log('ERROR markComment service: ', error);
            return null
        }
    }
}