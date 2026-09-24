import { CommentStatisticEntity } from "../../statistic/domain/statistic.entity";
import { IMapCommentStatistic } from "./comment.dtos";
import { ICommentEntity } from "./comment.entity";

export const mapCommentStatistic = (
    comments: CommentStatisticEntity[]
): IMapCommentStatistic => {
    return comments.reduce<IMapCommentStatistic>((acc, comment) => {
        acc[comment.commentId] = comment;
        return acc;
    }, {});
};