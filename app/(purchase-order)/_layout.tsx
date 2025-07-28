import { Stack } from 'expo-router';

export default function PurchaseOrderStackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Purchase Orders',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="view-purchase-order"
                options={{
                    title: 'View Purchase Order',
                    headerShown: true,
                }}
            />
        </Stack>
    );
} 