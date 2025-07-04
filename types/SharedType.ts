interface PaginationMeta {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
}

interface MetaData {
    approved: number;
    declined: number;
    draft: number;
    pending: number;
}

export interface Meta {
    pagination: PaginationMeta;
    meta_data: MetaData;
}
