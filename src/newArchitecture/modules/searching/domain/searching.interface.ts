import { SearchingEntity } from "./searching.entity";

export interface ISearchingRepository {
    getQueries: (query: string, offset: number, limit: number) => Promise<SearchingEntity[] | null>
    // updateQueryWeight: (query: string) => Promise<SearchingEntity | null>
    // createQuery: (query: string) => Promise<SearchingEntity | null>
    upsertQuery: (query: string) => Promise<SearchingEntity | null>
}