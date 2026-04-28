interface IComment {
    id: string;
    text: string;
    likes: number;
    dislikes: number;
    datePublication: string;
    parentCommentId: string;
    channel: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
    repliesCount: number;
}

const mapToIComment = (dbComment: any): IComment => {
    return {
        id: dbComment.id,
        text: dbComment.text,
        likes: dbComment.likes_count || 0,
        dislikes: dbComment.dislikes_count || 0,
        datePublication: dbComment.created_date,
        parentCommentId: dbComment.parent_comment_id || '',
        channel: {
            id: dbComment.channel?.id || dbComment.channel_id,
            username: dbComment.channel?.name || dbComment.channel?.username || '',
            avatarUrl: dbComment.channel?.avatar_url || dbComment.avatar_url || ''
        },
        repliesCount: parseInt(dbComment.repliesCount) || 0
    };
};

export const mapCommentsToIComment = (dbComments: any[]): IComment[] => {
    return dbComments.map(comment => mapToIComment(comment));
};