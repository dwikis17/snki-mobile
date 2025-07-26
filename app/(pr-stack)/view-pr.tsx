import { Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchPurchaseRequestByCode } from '@/server-actions/PurchaseRequestAction';
import { ActivityIndicator } from 'react-native-paper';

export default function ViewPR() {
    const { code } = useLocalSearchParams<{ code: string }>();

    const { data: purchaseRequest, isLoading, error } = useQuery({
        queryKey: ['purchase-request-detail', code],
        queryFn: () => fetchPurchaseRequestByCode(code!),
        enabled: !!code,
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading purchase request...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error loading purchase request</Text>
                <Text style={styles.errorSubText}>{error.message}</Text>
            </View>
        );
    }

    if (!purchaseRequest) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Purchase request not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Purchase Request: {purchaseRequest.code}</Text>
            <Text style={styles.status}>Status: {purchaseRequest.status}</Text>
            <Text style={styles.createdBy}>Created by: {purchaseRequest.created_by}</Text>
            <Text style={styles.date}>Created: {new Date(purchaseRequest.created_at).toLocaleDateString()}</Text>

            {/* Add more details here as needed */}
            <Text style={styles.sectionTitle}>Items ({purchaseRequest.items.length})</Text>
            {purchaseRequest.items.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <Text style={styles.itemName}>{item.item.name}</Text>
                    <Text style={styles.itemDetails}>
                        Quantity: {item.quantity} | Price: ${item.item_price}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F6F8FB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1F2937',
    },
    status: {
        fontSize: 16,
        marginBottom: 8,
        color: '#374151',
    },
    createdBy: {
        fontSize: 14,
        marginBottom: 4,
        color: '#6B7280',
    },
    date: {
        fontSize: 14,
        marginBottom: 16,
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        color: '#1F2937',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
        color: '#1F2937',
    },
    itemDetails: {
        fontSize: 14,
        color: '#6B7280',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 18,
        color: '#DC2626',
        textAlign: 'center',
    },
    errorSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
});   