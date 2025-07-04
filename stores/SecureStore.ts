import * as SecureStore from 'expo-secure-store';


export const storeTokens = async (token: string) => {
    await SecureStore.setItemAsync('token', token);
};

export const getTokens = async () => {
    const token = await SecureStore.getItemAsync('token');
    return { token };
};

export const deleteTokens = async () => {
    await SecureStore.deleteItemAsync('token');
};