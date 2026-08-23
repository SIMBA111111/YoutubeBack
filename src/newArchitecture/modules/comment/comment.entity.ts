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

  constructor(data: any) {
    this.id = data.id;
    this.text = data.text || '';
    this.likeCount = data.like_count || 0;
    this.dislikeCount = data.dislike_count || 0;
    this.videoId = data.video_id;
    this.channelId = data.channel_id;
    this.parentCommentId = data.parent_comment_id || null;
    this.createdDate = data.created_date;
    this.updatedDate = data.updated_date;
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