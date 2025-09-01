// stores/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeTokens, getTokens, deleteTokens } from './SecureStore';
import { UserType } from '@/types/UserType';
import { headers } from '@/contants/headers';
import { registerDevice } from '@/server-actions/PushNotification';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
    registerDeviceToken: () => Promise<string | null>;
}

// Helper function to register for push notifications
async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Permission not granted to get push token for push notification!');
            return null;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            console.log('Project ID not found');
            return null;
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            return pushTokenString;
        } catch (e: unknown) {
            console.log(`Error getting push token: ${e}`);
            return null;
        }
    } else {
        console.log('Must use physical device for push notifications');
        return null;
    }
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

            // Register device token after successful sign-in
            try {
                const deviceToken = await get().registerDeviceToken();
                if (deviceToken) {
                    await registerDevice({
                        device_type: Platform.OS as 'ios' | 'android',
                        expo_push_token: deviceToken,
                    });
                    console.log('Device token registered successfully');
                }
            } catch (error) {
                console.error('Failed to register device token:', error);
                // Don't throw error here as sign-in was successful
            }
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

    registerDeviceToken: async () => {
        try {
            // Set up notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const token = await registerForPushNotificationsAsync();
            return token;
        } catch (error) {
            console.error('Error registering device token:', error);
            return null;
        }
    },
}));