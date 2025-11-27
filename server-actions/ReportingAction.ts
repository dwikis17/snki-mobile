import { headers } from "@/contants/headers";
import { StatisticsRequest, StatisticsResponse, TopItemsResponse, TopItem } from "@/types/ReportingTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/reporting`;

export const fetchStatistics = async (params: StatisticsRequest): Promise<StatisticsResponse> => {
    const fullUrl = `${apiUrl}/statistic/full`;
    const token = await getTokens();

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch statistics');
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchTopItems = async (params: Partial<StatisticsRequest>): Promise<TopItemsResponse> => {
    const fullUrl = `${apiUrl}/statistic/full`;
    const token = await getTokens();

    const requestBody = {
        ...params,
        sections: ["top_items"]
    };

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch top items');
        }

        // Assuming the API returns the data in data.data.top_items when requesting top_items section
        return {
            success: data.success,
            message: data.message,
            data: data.data?.top_items || []
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};
