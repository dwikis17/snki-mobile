import { Meta } from "./SharedType";

export type QuotationStatus = 'pending' | 'qualified' | 'unqualified'

export interface QuotationParams {
    page?: number;
    limit?: number;
    status?: QuotationStatus;
    start_date?: string; // 'YYYY-MM-DD'
    end_date?: string;   // 'YYYY-MM-DD'
    quotation_code?: string;
    purchase_request_code?: string;
}

type Creator = {
    id: number;
    name: string;
    email: string;
    phone: string;
    role_id: number;
    status: string;
};
export type QuotationList = {
    id: number;
    code: string;
    purchase_request_code: string;
    client_name: string;
    destination_name: string;
    total_item_count: number;
    status: 'pending' | 'qualified' | 'unqualified';
    total_item_price: number;
    total_shipping_price: number;
    total_additional_cost: number;
    margin_price: number;
    rounding_up: number;
    total_price: number;
    created_by: string;
    created_at: string;
    updated_at: string;
};

export interface QuotationListResponse {
    data: QuotationList[];
    meta: Meta;
}

type Client = {
    id: number;
    name: string;
    logo: string;
    address: string;
    phone_office: string;
    map_link: string;
    website: string;
    pic_name: string;
    pic_phone: string;
    created_at: string;
    updated_at: string;
};


type Destination = {
    id: number;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
};


type Item = {
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

type Shipping = {
    shipping_method_id: number;
    shipping_method_code: string;
    origin_code: string;
    destination_code: string;
    service_type: string;
    price: number;
};

export type QuotationItem = {
    id: number;
    item: Item;
    specification: string;
    quantity: number;
    estimated_arrival: string;
    item_price: number;
    unit_quoted_price: {
        shipping_price: number;
        additional_cost: number;
        margin_price: number;
        rounding_up: number;
        item_price: number;
        quoted_price: number;
    };
    total_quoted_price: {
        shipping_price: number;
        additional_cost: number;
        margin_price: number;
        rounding_up: number;
        item_price: number;
        quoted_price: number;
    };
    shipping: Shipping[];
    additional_cost: number | null;
};

export type QuotationDetail = {
    id: number;
    code: string;
    purchase_request_code: string;
    purchase_order_code: string;
    client: Client;
    destination: Destination;
    status: QuotationStatus;
    items: QuotationItem[];
    margin_percent: number;
    shipping_price: number;
    additional_cost: number;
    margin_price: number;
    rounding_up: number;
    grand_total_price: number;
    creator: Creator;
    reviewer: {
        id: number;
        name: string;
        email: string;
        phone: string;
        role_id: number;
        status: string;
    };
    updated_at: string;
    created_at: string;
    reason: any[];
};