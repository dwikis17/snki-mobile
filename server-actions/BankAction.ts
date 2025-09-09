import { headers } from "@/contants/headers";
import { BankListResponse } from "@/types/BankTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/settings/bank-account`;

export const fetchBankList = async (page: number, limit: number): Promise<{
    success: boolean;
    errorCode?: number | string;
    message?: string;
    data?: BankListResponse;
}> => {
    const token = await getTokens();
    if (!token.token) {
        return { success: false, errorCode: 4000, message: "Token missing" };
    }

    const queryString = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
    }).toString();

    const fullUrl = `${apiUrl}?${queryString}`;

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
            return { success: false, errorCode: response.status, message: "Failed to fetch bank list" };
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error(error);
        return { success: false, errorCode: 500, message: "Internal server error" };
    }
};
