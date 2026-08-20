export enum VIDEO_ACCESS {
    RIVATE = 'RIVATE',
    PUBLIC = 'PUBLIC'
}

export type TVideoAccess = keyof typeof VIDEO_ACCESS