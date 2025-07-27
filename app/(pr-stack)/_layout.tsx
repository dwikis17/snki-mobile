import { Stack } from 'expo-router';

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
                }}
            />
        </Stack>
    );
} 