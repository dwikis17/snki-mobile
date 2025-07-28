import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchPurchaseOrderByCode } from '@/server-actions/PurchaseOrderAction';
import { PurchaseOrderDetail } from '@/types/PurchaseOrderTypes';
import { formatCurrency, formatDate, statusColor, statusTextColor } from '@/utils/CommonUtils';

export default function ViewPurchaseOrder() {
    const { code } = useLocalSearchParams<{ code: string }>();

    const { data: purchaseOrderResponse, isLoading, error } = useQuery<PurchaseOrderDetail, Error>({
        queryKey: ['purchase-order-detail', code],
        queryFn: () => fetchPurchaseOrderByCode(code!),
        enabled: !!code,
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={styles.loadingText}>Loading Purchase Order...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error loading purchase order</Text>
                <Text style={styles.errorSubText}>{error.message}</Text>
            </View>
        );
    }

    if (!purchaseOrderResponse?.data) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Purchase order not found</Text>
            </View>
        );
    }

    const purchaseOrder = purchaseOrderResponse.data;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.purchaseOrderCode}>{purchaseOrder.code}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusColor(purchaseOrder.status) }]}>
                        <Text style={[styles.statusText, { color: statusTextColor(purchaseOrder.status) }]}>
                            {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.quotationCode}>Quotation: {purchaseOrder.quotation_code}</Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Item Price</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(purchaseOrder.grand_total_item_price)}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Shipping</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(purchaseOrder.grand_total_shipping_price)}</Text>
                </View>
            </View>

            {/* Creator Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Created By</Text>
                <View style={styles.creatorCard}>
                    <Text style={styles.creatorName}>{purchaseOrder.creator.name}</Text>
                    <Text style={styles.creatorEmail}>{purchaseOrder.creator.email}</Text>
                    <Text style={styles.creatorPhone}>{purchaseOrder.creator.phone}</Text>
                </View>
            </View>

            {/* Item Purchase Orders */}
            {purchaseOrder.item_purchase_order.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Item Purchase Orders ({purchaseOrder.item_purchase_order.length})</Text>
                    {purchaseOrder.item_purchase_order.map((itemPO, index) => (
                        <View key={itemPO.id} style={styles.itemPOCard}>
                            <View style={styles.itemPOHeader}>
                                <Text style={styles.itemPOCode}>{itemPO.code}</Text>
                                <View style={[styles.itemPOStatus, { backgroundColor: statusColor(itemPO.status) }]}>
                                    <Text style={[styles.itemPOStatusText, { color: statusTextColor(itemPO.status) }]}>
                                        {itemPO.status.charAt(0).toUpperCase() + itemPO.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.itemPORow}>
                                <Text style={styles.itemPOLabel}>Provider:</Text>
                                <Text style={styles.itemPOValue}>{itemPO.provider.name}</Text>
                            </View>
                            <View style={styles.itemPORow}>
                                <Text style={styles.itemPOLabel}>Total Price:</Text>
                                <Text style={styles.itemPOValue}>{formatCurrency(itemPO.total_price)}</Text>
                            </View>
                            <View style={styles.itemPORow}>
                                <Text style={styles.itemPOLabel}>Due Date:</Text>
                                <Text style={styles.itemPOValue}>{formatDate(itemPO.due_date)}</Text>
                            </View>
                            <View style={styles.itemPORow}>
                                <Text style={styles.itemPOLabel}>Items:</Text>
                                <Text style={styles.itemPOValue}>{itemPO.items.length} items</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Shipping Purchase Orders */}
            {purchaseOrder.shipping_purchase_order.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Purchase Orders ({purchaseOrder.shipping_purchase_order.length})</Text>
                    {purchaseOrder.shipping_purchase_order.map((shippingPO, index) => (
                        <View key={shippingPO.id} style={styles.shippingPOCard}>
                            <View style={styles.shippingPOHeader}>
                                <Text style={styles.shippingPOCode}>{shippingPO.code}</Text>
                                <View style={[styles.shippingPOStatus, { backgroundColor: statusColor(shippingPO.status) }]}>
                                    <Text style={[styles.shippingPOStatusText, { color: statusTextColor(shippingPO.status) }]}>
                                        {shippingPO.status.charAt(0).toUpperCase() + shippingPO.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.shippingPORow}>
                                <Text style={styles.shippingPOLabel}>Provider:</Text>
                                <Text style={styles.shippingPOValue}>{shippingPO.provider.name}</Text>
                            </View>
                            <View style={styles.shippingPORow}>
                                <Text style={styles.shippingPOLabel}>Total Price:</Text>
                                <Text style={styles.shippingPOValue}>{formatCurrency(shippingPO.total_price)}</Text>
                            </View>
                            <View style={styles.shippingPORow}>
                                <Text style={styles.shippingPOLabel}>Due Date:</Text>
                                <Text style={styles.shippingPOValue}>{formatDate(shippingPO.due_date)}</Text>
                            </View>
                            <View style={styles.shippingPORow}>
                                <Text style={styles.shippingPOLabel}>Route:</Text>
                                <Text style={styles.shippingPOValue}>
                                    {shippingPO.shipping.origin_code} → {shippingPO.shipping.destination_code}
                                </Text>
                            </View>
                            {shippingPO.shipping.shipment_route && (
                                <View style={styles.shippingPORow}>
                                    <Text style={styles.shippingPOLabel}>Tracking:</Text>
                                    <Text style={styles.shippingPOValue}>{shippingPO.shipping.shipment_route.tracking_number}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Timestamps */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timestamps</Text>
                <View style={styles.timestampCard}>
                    <View style={styles.timestampRow}>
                        <Text style={styles.timestampLabel}>Created:</Text>
                        <Text style={styles.timestampValue}>{formatDate(purchaseOrder.created_at)}</Text>
                    </View>
                    <View style={styles.timestampRow}>
                        <Text style={styles.timestampLabel}>Updated:</Text>
                        <Text style={styles.timestampValue}>{formatDate(purchaseOrder.updated_at)}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8FB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F8FB',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 18,
        color: '#EF4444',
        textAlign: 'center',
    },
    errorSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    purchaseOrderCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    quotationCode: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669',
    },
    section: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    creatorCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    creatorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    creatorEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    creatorPhone: {
        fontSize: 14,
        color: '#6B7280',
    },
    itemPOCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemPOHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemPOCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    itemPOStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    itemPOStatusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    itemPORow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    itemPOLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    itemPOValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    shippingPOCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shippingPOHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    shippingPOCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    shippingPOStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    shippingPOStatusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    shippingPORow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    shippingPOLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    shippingPOValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    timestampCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timestampRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    timestampLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    timestampValue: {
        fontSize: 14,
        color: '#1F2937',
    },
}); 