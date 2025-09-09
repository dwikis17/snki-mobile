import { Stack } from 'expo-router';

export default function InvoiceStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Invoices',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="view-invoice"
                options={{
                    title: 'Invoice Detail',
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
