import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function PRStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Purchase Requests',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="view-pr"
                options={{
                    title: 'View Purchase Request',
                    headerShown: true,
                    headerBackVisible: true, // Force back button to show
                }}
            />
        </Stack>
    );
} 