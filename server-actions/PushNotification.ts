import { headers } from "@/contants/headers";
import { getTokens } from "@/stores/SecureStore";


type DeviceType = 'ios' | 'android';
interface RegisterDevicePayload {
    device_type: DeviceType;
    expo_push_token: string;
}

export const registerDevice = async (payload: RegisterDevicePayload) => {
    const token = await getTokens();
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/dashboard/user-device`, {
        method: 'POST',
        headers: {
            ...headers,
            'Authorization': `Bearer ${token.token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            message: data.message || 'Failed to register device',
            status: response.status,
            data: data,
        };
    }
    return data;
};