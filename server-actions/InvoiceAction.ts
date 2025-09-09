import { headers } from "@/contants/headers";
import { InvoiceParams, InvoiceListResponse, InvoiceDetail } from "@/types/InvoiceTypes";
import { MarkInvoicePaidPayload } from "@/types/BankTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/invoice`;

export const fetchInvoiceList = async (params: InvoiceParams): Promise<InvoiceListResponse> => {
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
            throw new Error('Failed to fetch invoice list');
        }

        return { data: data.data, meta: data.meta };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchInvoiceByCode = async (code: string): Promise<InvoiceDetail> => {
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
            throw new Error('Failed to fetch invoice detail');
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const markInvoiceAsPaid = async (payload: MarkInvoicePaidPayload): Promise<{
    success: boolean;
    errorCode?: number | string;
    message?: string;
    data?: any;
}> => {
    const token = await getTokens();
    if (!token.token) {
        return { success: false, errorCode: 4000, message: "Token missing" };
    }

    const fullUrl = `${apiUrl}`;

    try {
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
            },
            body: JSON.stringify(payload),
        });


        const data = await response.json();
        console.log(data, 'data');
        if (!response.ok) {
            return { success: false, errorCode: response.status, message: "Failed to mark invoice as paid" };
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error(error);
        return { success: false, errorCode: 500, message: "Internal server error" };
    }
};
