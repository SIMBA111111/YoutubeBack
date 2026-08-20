export interface IRepliesCommentsRequest {
  parentCommentId: string;
  userId: string
  limit?: number;
  offset?: number;
}

export class RepliesCommentsRequestDTO implements IRepliesCommentsRequest {
    public readonly parentCommentId: string;
    public readonly userId: string;
    public readonly limit: number;
    public readonly offset: number;
    
    constructor(data: IRepliesCommentsRequest) {
        // 1. Проверка обязательных полей
        if (!data.parentCommentId) {
        throw new Error('parentCommentId is required');
        }

        this.parentCommentId = data.parentCommentId;
        this.userId = data.userId || '';
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


export interface IRepliesCommentsResponse<T> {
    data: T;
}

export class RepliesCommentsResponseDTO<T> implements IRepliesCommentsResponse<T> {
    public readonly data: T;
    
    constructor(data: IRepliesCommentsResponse<T>) {
        this.data = data.data;
    }
}