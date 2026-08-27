import { ChannelEntity } from "./channel.entity";

export interface IChannelRepository {
    getChannelById: (channelId: string) => Promise<ChannelEntity>
}