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

export type PurchaseRequestItem = {
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
    estimated_arrival: string;
    shipping: {
        id: number;
        weight: number;
        length: number;
        width: number;
        height: number;
        volumetric_weight: number;
        chargeable_weight: number;
        shipping_price: number;
    }[];
    additional_cost: any[];
    shipping_prices: PurchaseRequestShippingPrice[] | null;
    total_item_price: number;
    total_shipping_price: number;
    total_additional_cost: number;
    margin_price: number;
}

export type PurchaseRequestShippingPrice = {
    destination_code: string;
    origin_code: string;
    price: number;
    service_type: string;
    shipping_method_code: string;
    shipping_method_id: number;
}

export type PurchaseRequestStatus = 'pending' | 'approved' | 'draft' | 'declined'

export interface PurchaseRequestDetail {
    id: number;
    code: string;
    status: PurchaseRequestStatus;
    client_id: number;
    client_address: string;
    destination_code: string;
    created_by: string;
    reviewed_by: string;
    margin_percent: number;
    items: PurchaseRequestItem[];
    additional_cost: AdditionalCost[];
    grand_total_item_price: number;
    grand_total_shipping_price: number;
    grand_total_additional_cost: number;
    grand_total_margin_price: number;
    reason: Reason[];
    updated_at: string;
    created_at: string;
}

export interface Reason {
    reason: string;
    reviewed_by: string;
    created_at: string;
}

export interface AdditionalCost {
    category: string;
    additional_cost: number;
}

export interface ApprovePurchaseRequest {
    status: 'approved' | 'declined' | 'draft';
    reason: string;
}