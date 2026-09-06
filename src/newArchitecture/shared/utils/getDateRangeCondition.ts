import { AnalyticsDateRange } from "../../modules/channel/domain/channel.consts";

export const getDateRangeInfo = (dateRange: string): AnalyticsDateRange => {
    const rangeMap: Record<string, AnalyticsDateRange> = {
        'lastDay': '1 day',
        'lastThreeDay': '3 days',
        'last7Day': '7 days',
        'last28Day': '28 days',
        'lastHalfYear': '6 months',
        'lastYear': '1 year',
        'allTime': '100 years'
    };
    
    return rangeMap[dateRange] || '1 day';
}