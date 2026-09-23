export interface ICommentEntity {
  id: string;
  text: string;
  likeCount: number;
  dislikeCount: number;
  videoId: string;
  channelId: string;
  parentCommentId: string | null;
  repliesCount: number
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
  repliesCount: number
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
    this.repliesCount = Number(data.repliesCount) || 0
    this.createdDate = data.created_date;
    this.updatedDate = data.updated_date;
  }

  static getCommentFullInfo = (rows: any[]) => {
    return rows.map(r => ({
      id: r.id,
      text: r.text,
      likeCount: Number(r.like_count ?? 0),
      dislikeCount: Number(r.dislike_count ?? 0),
      videoId: r.video_id,
      channelId: r.channel_id,
      parentCommentId: r.parent_comment_id ?? null,
      repliesCount: Number(r.repliesCount) ?? 0,
      createdDate: r.created_date,
      updatedDate: r.updated_date,
      channel: {
        id: r.channel.id,
        name: r.channel.name ?? null,
        avatarUrl: r.channel?.avatar_url && null
      },
      userLiked: r.user_liked ?? null,
      userDisliked: r.user_disliked ?? null,
      userStatId: r.user_stat_id ?? null
    }));
  }

  static fromDbRows = (dbRows: any[]): CommentEntity[] => {
    return dbRows.map(row => new CommentEntity(row));
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