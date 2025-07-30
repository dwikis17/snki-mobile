// stores/authStore.ts
import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import axios from 'axios'; // We'll use this for login/refresh calls within the store
import { router } from 'expo-router'; // For navigation
import { storeTokens, getTokens, deleteTokens } from './SecureStore';
import { UserType } from '@/types/UserType';
import { headers } from '@/contants/headers';

// Define your API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // **IMPORTANT: Replace with your actual backend URL**

interface AuthState {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: UserType | null;
    signIn: (credentials: { email: string; password: string }) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isLoggedIn: false,
    isLoading: true,
    user: null,
    signIn: async (credentials: { email: string; password: string }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(credentials),
            });
            const { data } = await response.json();
            await storeTokens(data.sid);
            set({ user: data, isLoggedIn: true });
        } catch (error) {
            throw error;
        }
    },
    signOut: async () => {
        await deleteTokens();
        set({ user: null, isLoggedIn: false });
    },
}));