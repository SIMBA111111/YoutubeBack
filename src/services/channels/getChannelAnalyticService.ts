import { getChannelSubsCount, getChannelSubsCountEvery12Hour, getChannelSubsCountEvery2Hour, getChannelViewsCount, getChannelViewsCountEvery12Hour, getChannelViewsCountEvery2Hour, getTotalSubscriptionByDateRange, getTotalViewsByDateRange } from "../../repositories/channel"
import { getDateRangeInfo } from "../../utils/getDateRangeCondition";

type TTab = 'views' | 'subscriptions'

export const getChannelAnalyticService = async (
    channelId: string,
    dateRange: string,
    tab: TTab
) => {
    const interval = getDateRangeInfo(dateRange);
    let analyticData;
    let totalViews;
    let totalSubscriptions;

    if (tab === 'subscriptions') {
        if (interval === '1 day') {
            analyticData = await getChannelSubsCountEvery2Hour(channelId, interval);
        } else if (interval === '3 days') {
            analyticData = await getChannelSubsCountEvery12Hour(channelId, interval);
        } else {
            analyticData = await getChannelSubsCount(channelId, interval);
        }
    } else {
        if (interval === '1 day') {
            analyticData = await getChannelViewsCountEvery2Hour(channelId, interval);
        } else if (interval === '3 days') {
            analyticData = await getChannelViewsCountEvery12Hour(channelId, interval);
        } else {
            analyticData = await getChannelViewsCount(channelId, interval);
        }
    }

    totalViews = await getTotalViewsByDateRange(channelId, interval)
    totalSubscriptions = await getTotalSubscriptionByDateRange(channelId, interval)

    return {
        analyticData: analyticData,
        totalViews: totalViews, 
        totalSubscriptions: totalSubscriptions
    }
};


// export const getChannelAnalyticService = async (channelId: string, dateRange: string, tab: TTab) => {
    // return tab === 'subscriptions' ? 
    //     await await getChannelSubsCount(channelId as string, dateRange)
    //         :
    //     await await getChannelViewsCount(channelId as string, dateRange)
// }