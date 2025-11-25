import { headers } from "@/contants/headers";
import { TrackingParams, TrackingListResponse, TrackingDetail } from "@/types/TrackingTypes";
import { getTokens } from "@/stores/SecureStore";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
const apiUrl = `${baseUrl}/dashboard/tracking`;

export const fetchTrackingList = async (params: TrackingParams): Promise<TrackingListResponse> => {
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
            throw new Error('Failed to fetch tracking list');
        }

        return { data: data.data, meta: data.meta };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchTrackingByCode = async (code: string): Promise<TrackingDetail> => {
    const fullUrl = `${apiUrl}/${code}`;
    const token = await getTokens();
    console.log(fullUrl, "fullUrl")

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                ...headers,
                'Authorization': `Bearer ${token.token}`,
            },
        });

        const data = await response.json();
        console.log(data, "data")

        if (!response.ok) {
            throw new Error('Failed to fetch tracking detail');
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
