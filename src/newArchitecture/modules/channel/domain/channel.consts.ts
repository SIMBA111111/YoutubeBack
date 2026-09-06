export type TTab = 'views' | 'subscriptions'

export type AnalyticsDateRange = 
  | '1 day'
  | '3 days'
  | '7 days'
  | '28 days'
  | '6 months'
  | '1 year'
  | '100 years';
  
export const ANALYTICS_DATA_RANGES: AnalyticsDateRange[] = [
    '1 day',
    '3 days',
    '7 days',
    '28 days',
    '6 months',
    '1 year',
    '100 years',
]