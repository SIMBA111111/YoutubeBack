import { getDateRangeInfo } from "../../shared/utils/getDateRangeCondition";
import { ISubscriptionRepository } from "../subscription/domain/subscription.interface";
import { VideoEntity } from "../video/domain/video.entity";
import { AnalyticsDateRange, TTab } from "./domain/channel.consts";
import { IGetChannelAnalyticServiceDto, IGetChannelInfoServiceDto, TSubscribeChannel } from "./domain/channel.dtos";
import { ChannelEntity } from "./domain/channel.entity";
import { IChannelRepository, IChannelServicve } from "./domain/channel.interface";

export class ChannelService implements IChannelServicve {
    constructor(
        private channelRepository: IChannelRepository,
        private subscriptionRepository: ISubscriptionRepository
    ) {}

    async getChannelInfo(channelUsername: string, followerId: string): Promise<IGetChannelInfoServiceDto> {
        let subData = null

        const channel = await this.channelRepository.getChannelByUsername(channelUsername);
        if(followerId) {
            subData = await this.subscriptionRepository.getSubscriptionDataByFollowerId(followerId, channel.id);
        }

        const result = {
            channelData: channel,
            subscriptionData: subData
        }

        return result
    }

    async getChannelAnalyticService(channelId: string, dateRange: AnalyticsDateRange, tab: TTab): Promise<IGetChannelAnalyticServiceDto> {
        const interval = getDateRangeInfo(dateRange);
        let analyticData;
        let totalViews;
        let totalSubscriptions;
    
        if (tab === 'subscriptions') {
            if (interval === '1 day') {
                analyticData = await this.subscriptionRepository.getChannelSubsCountEvery2Hour(channelId, interval);
            } else if (interval === '3 days') {
                analyticData = await this.subscriptionRepository.getChannelSubsCountEvery12Hour(channelId, interval);
            } else {
                analyticData = await this.subscriptionRepository.getChannelSubsCount(channelId, interval);
            }
        } else {
            if (interval === '1 day') {
                analyticData = await this.channelRepository.getChannelViewsCountEvery2Hour(channelId, interval);
            } else if (interval === '3 days') {
                analyticData = await this.channelRepository.getChannelViewsCountEvery12Hour(channelId, interval);
            } else {
                analyticData = await this.channelRepository.getChannelViewsCount(channelId, interval);
            }
        }
    
        totalViews = await this.channelRepository.getTotalViewsByDateRange(channelId, interval)
        totalSubscriptions = await this.subscriptionRepository.getTotalSubscriptionByDateRange(channelId, interval)
    
        return {
            analyticData: analyticData,
            totalViews: totalViews, 
            totalSubscriptions: totalSubscriptions
        }
    }

    async subscribeChannel(channelId: string, userId: string, isSubscribed: boolean): Promise<TSubscribeChannel> {
        let updatedSub;
    
        if (isSubscribed) {
            updatedSub = await this.subscriptionRepository.createUnsubscribeChannel(channelId, userId);
    
            await this.channelRepository.updateSubsCountChannel(channelId, "decr");
    
            return {
                isSubscribed: false,
            };
        } else {
            const subEntity = await this.subscriptionRepository.getSubscription(channelId, userId);
            
            if (!subEntity) {
                updatedSub = await this.subscriptionRepository.createSubscription(channelId, userId);
            } else {
                updatedSub = await this.subscriptionRepository.updateSubscribeChannelRepo(channelId, userId);
            }
            await this.channelRepository.updateSubsCountChannel(channelId, "inc");
        }

        return {
            isSubscribed: updatedSub.deleted
        }
    }

    async updateChannelData(channelId: string, newChannelData: any): Promise<ChannelEntity> {
        // Field name mapping (frontend -> database)
        const fieldMapping: Record<string, string> = {
            channelDescription: 'description',
            avatarUrl: 'avatar_url',
            bannerUrl: 'banner_url',
            channelName: 'name',
        };

        // Allowed fields for update (security)
        const updatableFields = [
            'name', 'username', 'email', 'avatar_url', 'banner_url',
            'description', 'country', 'links', 'notification_setting', 'is_save_history'
        ];

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(newChannelData)) {
            // Skip helper fields (not for DB)
            if (key === 'oldBannerUrl' || key === 'oldAvatarUrl') continue;

            // Map field name or keep as is
            let dbField = fieldMapping[key] || key;
            
            // Skip if field is not allowed
            if (!updatableFields.includes(dbField)) continue;

            // Special handling for 'links' field (string -> array)
            if (dbField === 'links' && typeof value === 'string') {
                const linksArray = value
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                
                updates.push(`${dbField} = $${paramIndex}::text[]`);
                values.push(linksArray);
            } else {
                updates.push(`${dbField} = $${paramIndex}`);
                values.push(value);
            }
            paramIndex++;
        }

        // Guard: nothing to update
        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(channelId);
        
        const updatedCHannel = await this.channelRepository.updateChannelData(updates, paramIndex, values)

        return updatedCHannel
    }
}