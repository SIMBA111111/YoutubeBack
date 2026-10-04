export interface ISearchingEntity {
    id: string;
    query: string;
    weight: number;
    createdDate: string;
    updatedDate: string;
}

export class SearchingEntity implements ISearchingEntity {
    id: string;
    query: string;
    weight: number;
    createdDate: string;
    updatedDate: string;

    constructor(data: any) {
        this.id = data.id;
        this.query = data.query;
        this.weight = data.weight;
        this.createdDate = data.created_date;
        this.updatedDate = data.updated_date;
    }

    static fromDbRows(dbRows: any[]): SearchingEntity[] {
        return dbRows.map(row => new SearchingEntity(row));
    }
}

