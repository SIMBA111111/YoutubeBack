export interface ICommentEntity {
  id: string;
  text: string;
  likeCount: number;
  dislikeCount: number;
  videoId: string;
  channelId: string;
  parentCommentId: string | null;
  createdDate: Date;
  updatedDate: Date;
}

export class CommentEntity implements ICommentEntity {
  id: string;
  text: string;
  likeCount: number;
  dislikeCount: number;
  videoId: string;
  channelId: string;
  parentCommentId: string | null;
  createdDate: Date;
  updatedDate: Date;

  constructor(data: ICommentEntity) {
    this.id = data.id;
    this.text = data.text || '';
    this.likeCount = data.likeCount || 0;
    this.dislikeCount = data.dislikeCount || 0;
    this.videoId = data.videoId;
    this.channelId = data.channelId;
    this.parentCommentId = data.parentCommentId || null;
    this.createdDate = data.createdDate;
    this.updatedDate = data.updatedDate;
  }
  // Бизнес-методы
//   getRating(): number {
//     return this.likeCount - this.dislikeCount;
//   }

//   isLikedByUser(userId: string): boolean {
    // Какая-то логика
    // return false;
//   }

//   canDelete(userId: string): boolean {
    // return this.channelId === userId;
//   }
}