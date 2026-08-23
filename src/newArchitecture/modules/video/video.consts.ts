export enum VIDEO_ACCESS {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE'
}

export type TVideoAccess = keyof typeof VIDEO_ACCESS