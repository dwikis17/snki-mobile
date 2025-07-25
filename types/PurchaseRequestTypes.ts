import { Meta } from "./SharedType";

export interface PurchaseRequestParams {
    page?: number;
    limit?: number;
    status?: PurchaseRequestStatus;
    start_date?: string; // 'YYYY-MM-DD'
    end_date?: string;   // 'YYYY-MM-DD'
    purchase_request_code?: string;
}

export type PurchaseRequestList = {
    id: number;
    code: string;
    client_name: string;
    destination_name: string;
    total_item_count: number;
    status: string;
    grand_total_item_price: number;
    grand_total_shipping_price: number;
    grand_total_additional_cost: number;
    grand_total_margin_price: number;
    grand_total: number;
    created_at: string;
    updated_at: string;
    created_by: string;
}

export interface PurchaseRequestListResponse {
    data: PurchaseRequestList[];
    meta: Meta;
}


export type PurchaseRequestStatus = 'pending' | 'approved' | 'draft' | 'declined' 