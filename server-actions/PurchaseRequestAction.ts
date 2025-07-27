import { headers } from "@/contants/headers";
import { PurchaseRequestParams, PurchaseRequestDetail } from "@/types/PurchaseRequestTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/purchase-request`;


export const fetchPurchaseRequestList = async (params: PurchaseRequestParams) => {
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
            throw new Error('Failed to fetch purchase request list');
        }

        return { data: data.data, meta: data.meta }
    } catch (error) {
        console.error(error);
        throw error;
    }

};

export const fetchPurchaseRequestByCode = async (code: string): Promise<PurchaseRequestDetail> => {
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch purchase request detail');
        }

        return data.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

