

export const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};
if (process.env.EXPO_PUBLIC_SECRET_KEY) {
    headers['STATIC-API-KEY'] = process.env.EXPO_PUBLIC_SECRET_KEY;
}
