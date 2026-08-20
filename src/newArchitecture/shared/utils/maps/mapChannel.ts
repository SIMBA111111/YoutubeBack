export interface ILink {
  id: string;
  name: string;
  url: string;
  linkAvatar: string;
}

export interface IChannel {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  description?: string;
  subscribersCount?: number;
  videosCount?: number;
  viewersCount?: number;
  country?: string;
  createdAt?: string;
  links: ILink[];
  notificationSetting?: boolean;
}

const mapToIComment = (dbComment: any): IChannel => {
  return {
    id: dbComment.id,
    text: dbComment.text,
    likes: dbComment.like_count || 0,
    dislikes: dbComment.dislike_count || 0,
    datePublication: dbComment.created_date,
    parentCommentId: dbComment.parent_comment_id || "",
    isLiked: dbComment.user_liked || false,
    isDisliked: dbComment.user_disliked || false,
    channel: {
      id: dbComment.channel?.id || dbComment.channel_id,
      username: dbComment.channel?.name || dbComment.channel?.username || "",
      avatarUrl: dbComment.channel?.avatar_url || dbComment.avatar_url || "",
    },
    repliesCount: parseInt(dbComment.repliesCount) || 0,
  };
};

export const mapCommentsToIComment = (dbComments: any[]): IChannel[] => {
  return dbComments.map((comment) => mapToIComment(comment));
};
