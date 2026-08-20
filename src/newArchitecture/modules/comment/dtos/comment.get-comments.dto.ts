import { TCommentFilters } from "../comment.consts";

export interface IGetCommentsRequest {
  videoId: string;
  userId: string
  filter: TCommentFilters
  limit?: number;
  offset?: number;
}

export class GetCommentsRequestDTO implements IGetCommentsRequest {
    public readonly videoId: string;
    public readonly userId: string;
    public readonly filter: TCommentFilters;
    public readonly limit: number;
    public readonly offset: number;
    
    constructor(data: IGetCommentsRequest) {
        // 1. Проверка обязательных полей
        if (!data.videoId) {
            throw new Error('parentCommentId is required');
        }

        this.videoId = data.videoId;
        this.userId = data.userId || '';
        this.filter = data.filter || 'FAMOUS';
        this.limit = data.limit ?? 10;
        this.offset = data.offset ?? 0;

        // 3. Проверка значений
        if (this.limit < 1 || this.limit > 100) {
            throw new Error('limit must be between 1 and 100');
        }

        if (this.offset < 0) {
            throw new Error('offset must be >= 0');
        }
    }
}


export interface IGetCommentsResponse<T> {
    data: T;
}

export class RepliesCommentsResponseDTO<T> implements IGetCommentsResponse<T> {
    public readonly data: T;
    
    constructor(data: IGetCommentsResponse<T>) {
        this.data = data.data;
    }
}