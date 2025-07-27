import { Stack } from 'expo-router';

export default function QuotationStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Quotations',
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="view-quotation"
                options={{
                    title: 'View Quotation',
                    headerShown: true,
                }}
            />
        </Stack>
    );
} 