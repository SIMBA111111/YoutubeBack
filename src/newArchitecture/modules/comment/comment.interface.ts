import { ICommentEntity } from "./comment.entity";

export interface ICommentRepository {
    getRepliesComment: (parentCommentId: string, userId: string, offset: number, limit: number) => Promise<ICommentEntity[]>
    getRepliesCommentCount: (parentCommentId: string) => Promise<number>
}

export interface IGetRepliesCommentResponse {
    comments: ICommentEntity[]
    commentsCount: number
}

export interface ICommentService {
    getRepliesComment: (parentCommentId: string, userId: string, offset: number, limit: number) => Promise<IGetRepliesCommentResponse>
}