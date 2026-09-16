import { IGetVideosDto } from "./video.dtos";
import { VideoEntity } from "./video.entity";

export const GetVideoDtoMap = (row: any): IGetVideosDto => ({
    video: new VideoEntity(row),
    channel: {
        channelId: row.channelid,
        channelUsername: row.channelusername,
        channelName: row.channelname,
        channelAvatarUrl: row.channelavatarurl,
    },
});