// stores/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeTokens, getTokens, deleteTokens } from './SecureStore';
import { UserType } from '@/types/UserType';
import { headers } from '@/contants/headers';

// Define your API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // **IMPORTANT: Replace with your actual backend URL**

// AsyncStorage keys
const AUTH_STORAGE_KEY = 'auth_state';

interface AuthState {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: UserType | null;
    signIn: (credentials: { email: string; password: string }) => Promise<void>;
    signOut: () => Promise<void>;
    loadAuthState: () => Promise<void>;
    clearAuthState: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isLoggedIn: false,
    isLoading: true,
    user: null,

    signIn: async (credentials: { email: string; password: string }) => {
        try {
            set({ isLoading: true });
            const response = await fetch(`${API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(credentials),
            });
            const { data } = await response.json();
            await storeTokens(data.sid);

            const authState = { user: data, isLoggedIn: true };
            set(authState);

            // Save auth state to AsyncStorage
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
        } catch (error) {
            set({ isLoading: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        try {
            set({ isLoading: true });
            await deleteTokens();
            await get().clearAuthState();
        } catch (error) {
            console.error('Error during sign out:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    loadAuthState: async () => {
        try {
            set({ isLoading: true });
            const storedAuthState = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

            if (storedAuthState) {
                const parsedState = JSON.parse(storedAuthState);
                set({
                    isLoggedIn: parsedState.isLoggedIn,
                    user: parsedState.user,
                });
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    clearAuthState: async () => {
        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            set({ user: null, isLoggedIn: false });
        } catch (error) {
            console.error('Error clearing auth state:', error);
        }
    },
}));