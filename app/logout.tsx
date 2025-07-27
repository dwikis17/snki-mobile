import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export default function LogoutScreen() {
    const { signOut } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Perform logout
                await signOut();

                // Navigate to login screen
                // The RootLayout will automatically redirect to Login when isLoggedIn becomes false
            } catch (error) {
                console.error('Logout error:', error);
                // Even if there's an error, we should still try to logout
                await signOut();
            }
        };

        performLogout();
    }, [signOut]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.text}>Logging out...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F8FB',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
}); 