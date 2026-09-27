import { IGetVideosDto, IViewedVideosDto } from "./video.dtos";
import { VideoEntity, ViewedVideoEntity } from "./video.entity";

export const GetVideoDtoMap = (row: any): IGetVideosDto => ({
    video: new VideoEntity(row),
    channel: {
        channelId: row.channelid,
        channelUsername: row.channelusername,
        channelName: row.channelname,
        channelAvatarUrl: row.channelavatarurl,
    },
});

export const GetViewedVideoDtoMap = (row: any): IViewedVideosDto => ({
    video: new ViewedVideoEntity(row),
    channel: {
        channelId: row.channelid,
        channelUsername: row.channelusername,
        channelName: row.channelname,
        channelAvatarUrl: row.channelavatarurl,
    },
});