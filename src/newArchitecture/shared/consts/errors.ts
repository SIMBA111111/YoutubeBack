export const ERRORS = {
    NOT_FOUND: 'NOT_FOUND'
} as const

export type TErrorsDto = keyof typeof ERRORS