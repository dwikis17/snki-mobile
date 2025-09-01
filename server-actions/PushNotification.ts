import { headers } from "@/contants/headers";


type DeviceType = 'ios' | 'android';
interface RegisterDevicePayload {
    device_type: DeviceType;
    expo_push_token: string;
}

export const registerDevice = async (payload: RegisterDevicePayload) => {

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/dashboard/user-device`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
    });
    console.log(response, 'response')
    if (!response.ok) {
        throw new Error('Failed to register device');
    }
    return response.json();
};