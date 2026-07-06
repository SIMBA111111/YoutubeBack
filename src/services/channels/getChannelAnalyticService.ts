import { getChannelSubsCount, getChannelSubsCountEvery12Hour, getChannelSubsCountEvery2Hour, getChannelViewsCount, getChannelViewsCountEvery12Hour, getChannelViewsCountEvery2Hour } from "../../repositories/channel"
import { getDateRangeInfo } from "../../utils/getDateRangeCondition";

type TTab = 'views' | 'subscriptions'

export const getChannelAnalyticService = async (
    channelId: string,
    dateRange: string,
    tab: TTab
) => {
    const interval = getDateRangeInfo(dateRange);
    let result;

    if (tab === 'subscriptions') {
        if (interval === '1 day') {
            result = await getChannelSubsCountEvery2Hour(channelId, interval);
        } else if (interval === '3 days') {
            result = await getChannelSubsCountEvery12Hour(channelId, interval);
        } else {
            result = await getChannelSubsCount(channelId, interval);
        }
    } else {
        if (interval === '1 day') {
            result = await getChannelViewsCountEvery2Hour(channelId, interval);
        } else if (interval === '3 days') {
            result = await getChannelViewsCountEvery12Hour(channelId, interval);
        } else {
            result = await getChannelViewsCount(channelId, interval);
        }
    }

    return result;
};


// export const getChannelAnalyticService = async (channelId: string, dateRange: string, tab: TTab) => {
    // return tab === 'subscriptions' ? 
    //     await await getChannelSubsCount(channelId as string, dateRange)
    //         :
    //     await await getChannelViewsCount(channelId as string, dateRange)
// }