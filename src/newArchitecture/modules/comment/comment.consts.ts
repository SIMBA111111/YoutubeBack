export enum COMMENTS_FILTERS {
    NEW = 'NEW',
    FAMOUS = 'FAMOUS' 
}

export enum COMMENTS_ACTIONS {
    INCREASE = 'INCREASE',
    DECREASE = 'DECREASE'
}

export type TCommentActions = keyof typeof COMMENTS_ACTIONS
export type TCommentFilters = keyof typeof COMMENTS_FILTERS