import { Stack } from 'expo-router';

export default function TrackingStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Tracking',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="view-tracking"
                options={{
                    title: 'Tracking Detail',
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
