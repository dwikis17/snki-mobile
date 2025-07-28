import { headers } from "@/contants/headers";
import { PurchaseOrderParams, PurchaseOrderDetail } from "@/types/PurchaseOrderTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/purchase-order`;


export const fetchPurchaseOrderList = async (params: PurchaseOrderParams) => {
    if (params.status === undefined) {
        delete params.status;
    }
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const fullUrl = `${apiUrl}?${queryString}`;
    const token = await getTokens();

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
            },
        });

        const { data } = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch purchase order list');
        }

        return { data: data.data, meta: data.meta }
    } catch (error) {
        console.error(error);
        throw error;
    }

};

export const fetchPurchaseOrderByCode = async (code: string): Promise<PurchaseOrderDetail> => {
    const fullUrl = `${apiUrl}/${code}`;
    const token = await getTokens();
    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
            },
        });
        const { data } = await response.json();
        if (!response.ok) {
            throw new Error('Failed to fetch purchase order detail');
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};