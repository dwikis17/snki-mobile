import { headers } from "@/contants/headers";
import { QuotationParams, QuotationDetail } from "@/types/QuotationTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/quotation`;

export const fetchQuotationList = async (params: QuotationParams) => {
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
            throw new Error('Failed to fetch quotation list');
        }

        return { data: data.data, meta: data.meta }
    } catch (error) {
        console.error(error);
        throw error;
    }

};

export const fetchQuotationByCode = async (code: string): Promise<QuotationDetail> => {
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
            throw new Error('Failed to fetch quotation detail');
        }

        return data.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export interface ApproveQuotation {
    status: 'qualified' | 'unqualified' | 'unqualified_draft';
    reason?: string;
    purchase_order_code?: string;
}

export const approveQuotationOrDecline = async (code: string, payload: ApproveQuotation) => {
    const fullUrl = `${apiUrl}/approval/${code}`;
    const token = await getTokens();

    try {
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to approve quotation');
        }

        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}
