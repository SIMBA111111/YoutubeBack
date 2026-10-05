import { ApiResponseDTO } from "../../shared/dtos/response.dto";
import { pool } from "../../shared/utils/pg";
import { ISearchingEntity, SearchingEntity } from "./domain/searching.entity";
import { ISearchingRepository } from "./domain/searching.interface";

export class SearchingRepository implements ISearchingRepository {
    async getQueries(query: string, offset: number, limit: number): Promise<SearchingEntity[] | null> {
        try {
            const sql = `
                SELECT * FROM searching
                WHERE query ILIKE $1
                ORDER BY weight DESC
                OFFSET $2
                LIMIT $3
            `

            const res = await pool.query(sql, [`%${query}%`, offset, limit])
            return SearchingEntity.fromDbRows(res.rows)
        } catch (error) {
            console.log('ERROR SearchingRepository getQueries: ', error);
            return null
        }
    }


    async upsertQuery(query: string): Promise<SearchingEntity | null> {
        console.log('upsertQuery');
        
        try {
            const sql = `
                INSERT INTO searching (query, weight)
                VALUES ($1, 1)
                ON CONFLICT (query)
                DO UPDATE SET
                    weight = searching.weight + 1,
                    updated_date = now()
                RETURNING id, query, weight, created_date, updated_date
            `;

            const res = await pool.query(sql, [query]);

            console.log('res: ', res.rows);

            if (res.rowCount === 0) return null;
            return SearchingEntity.fromDbRows(res.rows)[0];
        } catch (error) {
            console.log('ERROR SearchingRepository upsertQuery: ', error);
            return null;
        }
    };


    // async updateQueryWeight(query: string): Promise<SearchingEntity | null> {
    //     try {
    //         const sql = `
    //             UPDATE searching 
    //             SET weight = weight + 1, updated_date = now()
    //             WHERE query = $1
    //             RETURNING *
    //         `

    //         const res = await pool.query(sql, [`%${query}%`])
    //         return SearchingEntity.fromDbRows(res.rows)[0]
    //     } catch (error) {
    //         console.log('ERROR SearchingRepository updateQueryWeight: ', error);
    //         return null
    //     }
    // }

    // async createQuery(query: string): Promise<SearchingEntity | null> {
    //     try {
    //         const sql = `
    //             INSERT INTO searching (query, weight)
    //             VALUES ($1, 1)
    //             RETURNING *
    //         `

    //         const res = await pool.query(sql, [`%${query}%`])
    //         return SearchingEntity.fromDbRows(res.rows)[0]
    //     } catch (error) {
    //         console.log('ERROR SearchingRepository updateQueryWeight: ', error);
    //         return null
    //     }
    // }
}