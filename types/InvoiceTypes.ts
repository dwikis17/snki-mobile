export type InvoiceStatus = 'paid' | 'unpaid'

export interface InvoiceParams {
    page?: number;
    limit?: number;
    invoice_code?: string;
    status?: InvoiceStatus;
}

export type Invoice = {
    id: number;
    code: string;
    quotation_code: string;
    client_name: string;
    total_item_count: number;
    total_price: number;
    status: string;
    due_date: string;
    created_at: string;
    updated_at: string;
};

type MetaData = {
    meta_data: {
        status_counts: {
            paid: number;
            unpaid: number;
        };
        status_total_price: {
            paid: number;
            unpaid: number;
        };
    };
    pagination: {
        limit: number;
        page: number;
        sort: string;
        total_rows: number;
        total_pages: number;
    };
};

export interface InvoiceListResponse {
    data: Invoice[];
    meta: MetaData;
};

type InvoiceDetailCreator = {
    id: number;
    name: string;
    email: string;
    phone: string;
    role_id: number;
    status: string;
};

type InvoiceDetailBankAccount = {
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

type InvoiceDetailItem = {
    id: number;
    item: {
        id: number;
        code: string;
        name: string;
        source: string;
        picture: string;
        unit: string;
        price: number;
        weight: number;
        length: number;
        width: number;
        height: number;
        created_at: string;
        updated_at: string;
    };
    specification: string;
    quantity: number;
    item_price: number;
    total_price: number;
    created_at: string;
};

export interface InvoiceDetail {
    data: {
        id: number;
        code: string;
        quotation_id: number;
        quotation_code: string;
        status: string;
        creator: InvoiceDetailCreator;
        item_price: number;
        tax_percent: number;
        tax_amount: number;
        total_price: number;
        notes: string;
        terms: string;
        due_date: string;
        paid_date: string;
        bank_account: InvoiceDetailBankAccount;
        created_at: string;
        updated_at: string;
        total_price_wording: string;
        is_taxed: boolean;
        items: InvoiceDetailItem[];
    };
};
