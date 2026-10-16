export enum VIDEO_ACCESS {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE'
}

export type TVideoAccess = keyof typeof VIDEO_ACCESS


export enum SORT {
    DESC = 'DESC',
    ASC = 'ASC'
}

export type TSort = keyof typeof SORT


export enum VIDEO_TYPE_FILTER {
    ONLY_SHORTS = 'ONLY_SHORTS',
    ONLY_FULL = 'ONLY_FULL',
    ALL = 'ALL'
} 

export type TVideoTypeFilter = keyof typeof VIDEO_TYPE_FILTER


export enum FiltersEnum {
    NEWS='NEWS',
    FAME='FAME',
    OLD='OLD'
}

export type TVideoAgeFilter = keyof typeof FiltersEnum