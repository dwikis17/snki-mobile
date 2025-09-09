export type TrackingStatus = 'preparing' | 'in_transit' | 'partially_arrived' | 'completed' | 'cancelled';

export interface TrackingParams {
    page?: number;
    limit?: number;
    status?: TrackingStatus;
    quotation_code?: string;
    purchase_order_code?: string;
}

export type Tracking = {
    id: number;
    quotation_code: string;
    purchase_order_code: string;
    client_name: string;
    destination_name: string;
    status: string;
    created_at: string;
    updated_at: string;
};

type MetaData = {
    meta_data: {
        preparing: number;
        in_transit: number;
        partially_arrived: number;
        completed: number;
        cancelled: number;
    };
    pagination: {
        limit: number;
        page: number;
        sort: string;
        total_rows: number;
        total_pages: number;
    };
};

export interface TrackingListResponse {
    data: Tracking[];
    meta: MetaData;
};

type TrackingDetailClient = {
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

type TrackingDetailDestination = {
    id: number;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
};

type TrackingDetailShipmentBatch = {
    id: number;
    batch_number: number;
    status: string;
    total_route: number;
};

type TrackingDetailItem = {
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

type TrackingDetailDeliveryOrderItem = {
    id: number;
    quotation_item_id: number;
    quantity: number;
    notes: string;
    total_weight: number;
    item: TrackingDetailItem;
};

type TrackingDetailDeliveryOrder = {
    id: number;
    code: string;
    department: string;
    container_number: string;
    vehicle_number: string;
    total_item_count: number;
    created_at: string;
    items: TrackingDetailDeliveryOrderItem[];
};

type TrackingDetailPackingListItem = {
    id: number;
    quotation_item_id: number;
    quantity: number;
    notes: string;
    total_weight: number;
    item: TrackingDetailItem;
};

type TrackingDetailPackingList = {
    id: number;
    code: string;
    department: string;
    total_item_count: number;
    created_at: string;
    items: TrackingDetailPackingListItem[];
};

export interface TrackingDetail {
    data: {
        id: number;
        quotation_code: string;
        purchase_order_code: string;
        purchase_request_code: string;
        status: string;
        client: TrackingDetailClient;
        destination: TrackingDetailDestination;
        created_at: string;
        updated_at: string;
        shipment_batch: TrackingDetailShipmentBatch[];
        delivery_orders: TrackingDetailDeliveryOrder[];
        packing_list: TrackingDetailPackingList[];
    };
};

