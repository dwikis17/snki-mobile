
export type PurchaseOrderStatus = 'draft' | 'pending' | 'purchased'

export interface PurchaseOrderParams {
    page?: number;
    limit?: number;
    status?: PurchaseOrderStatus;
    quotation_code?: string;
    purchase_order_code?: string;
}

export type PurchaseOrder = {
    id: number;
    quotation_code: string;
    code: string;
    client_name: string;
    destination_name: string;
    total_purchase_order_sub_count: number;
    total_item_count: number;
    provider_item_count: number;
    provider_shipping_count: number;
    status: string;
    quotation_total_price: number;
    grand_total_price: number;
    grand_total_item_price: number;
    grand_total_shipping_price: number;
    created_at: string;
    updated_at: string;
    created_by: string;
};



type MetaData = {
    meta_data: {
        status_counts: {
            draft: number;
            pending: number;
            purchased: number;
        };
        status_quotation_total_price: {
            draft: number;
            pending: number;
            purchased: number;
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

export type PurchaseOrderListResponse = {
    data: PurchaseOrder[];
    meta: MetaData;
};


type PurchaseOrderDetailProvider = {
    id: number;
    name: string;
    logo: string;
    address: string;
    type: string;
    phone_office: string;
    map_link: string;
    website: string;
    pic_name: string;
    pic_phone: string;
    created_at: string;
    updated_at: string;
};

type PurchaseOrderDetailItem = {
    id: number;
    code: string;
    status: string;
    total_price: number;
    due_date: string;
    created_at: string;
    updated_at: string;
    provider: PurchaseOrderDetailProvider;
    items: {
        id: number;
        quotation_item_id: number;
        item_id: number;
        specification: string;
        item_price: number;
        quantity: number;
        created_at: string;
        updated_at: string;
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
    }[];
    shipping: {
        id: number;
        origin_code: string;
        destination_code: string;
        shipping_price: number;
        shipping_price_unit: number;
        created_at: string;
        updated_at: string;
        items: null;
        shipment_route: {
            id: number;
            purchase_order_sub_id: number;
            batch_number: number;
            tracking_number: string;
            leg_sequence: number;
        };
    };
};

type PurchaseOrderDetailShipping = {
    id: number;
    code: string;
    status: string;
    total_price: number;
    due_date: string;
    created_at: string;
    updated_at: string;
    provider: PurchaseOrderDetailProvider;
    shipping: {
        id: number;
        origin_code: string;
        destination_code: string;
        shipping_price: number;
        shipping_price_unit: number;
        created_at: string;
        updated_at: string;
        items: {
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
            quotation_item_id: number;
            quantity: number;
            packages: number;
            specification: string;
            shipping_item_price: number;
        }[];
        shipment_route: {
            id: number;
            purchase_order_sub_id: number;
            batch_number: number;
            tracking_number: string;
            leg_sequence: number;
        };
    };
};

type PurchaseOrderDetailCreator = {
    id: number;
    name: string;
    email: string;
    phone: string;
    role_id: number;
    status: string;
};

export type PurchaseOrderDetail = {
    data: {
        id: number;
        code: string;
        status: string;
        grand_total_item_price: number;
        grand_total_shipping_price: number;
        quotation_code: string;
        created_at: string;
        updated_at: string;
        item_purchase_order: PurchaseOrderDetailItem[];
        shipping_purchase_order: PurchaseOrderDetailShipping[];
        creator: PurchaseOrderDetailCreator;
    };
    meta: MetaData;
};