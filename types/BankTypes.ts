export type Bank = {
    id: number;
    bank_name: string;
    bank_code: string;
    account_number: string;
    account_name: string;
    is_default: boolean;
    status: string;
    created_at: string;
    updated_at: string;
};

type PaginationMeta = {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
};

export interface BankListResponse {
    data: Bank[];
    meta: PaginationMeta;
};

export interface MarkInvoicePaidPayload {
    id: number;
    quotation_id: number;
    status: 'paid';
    paid_bank_account_id: number;
    paid_date: string;
    due_date: string;
};
