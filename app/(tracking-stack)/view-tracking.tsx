import { fetchTrackingByCode } from '@/server-actions/TrackingAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { TrackingDetail } from '@/types/TrackingTypes';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function ViewTrackingScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'delivery' | 'packing'>('delivery');

    const { data, isLoading, refetch, isFetching } = useQuery<TrackingDetail, Error, TrackingDetail>({
        queryKey: ['tracking-detail', code],
        queryFn: () => fetchTrackingByCode(code!),
        enabled: !!code,
    });


    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={styles.loadingText}>Loading tracking details...</Text>
            </View>
        );
    }

    if (!data?.data) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Tracking record not found</Text>
            </View>
        );
    }

    const tracking = data.data;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing':
                return '#F59E0B';
            case 'in_transit':
                return '#3B82F6';
            case 'partially_arrived':
                return '#8B5CF6';
            case 'completed':
                return '#10B981';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'preparing':
                return 'Preparing';
            case 'in_transit':
                return 'In Transit';
            case 'partially_arrived':
                return 'Partially Arrived';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing || isFetching}
                    onRefresh={onRefresh}
                    colors={["#1976D2"]}
                    tintColor="#1976D2"
                />
            }
        >
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={styles.headerRow}>
                    <Text style={styles.quotationCode}>{tracking.quotation_code}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tracking.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(tracking.status)}</Text>
                    </View>
                </View>
                <Text style={styles.poCode}>PO: {tracking.purchase_order_code}</Text>
                <Text style={styles.prCode}>PR: {tracking.purchase_request_code}</Text>
            </View>

            {/* Client & Destination Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Client & Destination</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Client</Text>
                        <Text style={styles.infoValue}>{tracking.client.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{tracking.client.address}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Destination</Text>
                        <Text style={styles.infoValue}>{tracking.destination.name} ({tracking.destination.code})</Text>
                    </View>
                    {tracking.client.phone_office && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{tracking.client.phone_office}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Shipment Batches */}
            {(tracking.shipment_batch?.length ?? 0) > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipment Batches ({tracking.shipment_batch?.length ?? 0})</Text>
                    {tracking.shipment_batch?.map((batch, index) => (
                        <View key={batch.id} style={styles.batchCard}>
                            <View style={styles.batchHeader}>
                                <Text style={styles.batchNumber}>Batch #{batch.batch_number}</Text>
                                <Text style={styles.batchStatus}>{batch.status}</Text>
                            </View>
                            <Text style={styles.batchRoutes}>Total Routes: {batch.total_route}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Delivery Orders & Packing Lists Tabs */}
            {((tracking.delivery_orders?.length ?? 0) > 0 || (tracking.packing_list?.length ?? 0) > 0) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Orders & Lists</Text>

                    {/* Tab Navigation */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'delivery' && styles.activeTab]}
                            onPress={() => setActiveTab('delivery')}
                        >
                            <Text style={[styles.tabText, activeTab === 'delivery' && styles.activeTabText]}>
                                Delivery Orders ({tracking.delivery_orders?.length ?? 0})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'packing' && styles.activeTab]}
                            onPress={() => setActiveTab('packing')}
                        >
                            <Text style={[styles.tabText, activeTab === 'packing' && styles.activeTabText]}>
                                Packing Lists ({tracking.packing_list?.length ?? 0})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    <View style={styles.tabContent}>
                        {activeTab === 'delivery' && (
                            <View>
                                {(tracking.delivery_orders?.length ?? 0) > 0 ? (
                                    tracking.delivery_orders?.map((order) => (
                                        <View key={order.id} style={styles.orderCard}>
                                            <View style={styles.orderHeader}>
                                                <Text style={styles.orderCode}>{order.code}</Text>
                                                <Text style={styles.orderItems}>{order.total_item_count} items</Text>
                                            </View>
                                            <View style={styles.orderDetails}>
                                                <Text style={styles.orderDetail}>Department: {order.department}</Text>
                                                <Text style={styles.orderDetail}>Container: {order.container_number}</Text>
                                                <Text style={styles.orderDetail}>Vehicle: {order.vehicle_number}</Text>
                                            </View>
                                            <Text style={styles.orderDate}>
                                                Created: {new Date(order.created_at).toLocaleDateString()}
                                            </Text>

                                            {/* Order Items */}
                                            {order.items.length > 0 && (
                                                <View style={styles.itemsContainer}>
                                                    <Text style={styles.itemsTitle}>Items:</Text>
                                                    {order.items.map((item) => (
                                                        <View key={item.id} style={styles.itemRow}>
                                                            <Text style={styles.itemName}>{item.item.name}</Text>
                                                            <Text style={styles.itemQuantity}>
                                                                {item.quantity} {item.item.unit} ({item.total_weight}kg)
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>No delivery orders found</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'packing' && (
                            <View>
                                {(tracking.packing_list?.length ?? 0) > 0 ? (
                                    tracking.packing_list?.map((list) => (
                                        <View key={list.id} style={styles.packingCard}>
                                            <View style={styles.packingHeader}>
                                                <Text style={styles.packingCode}>{list.code}</Text>
                                                <Text style={styles.packingItems}>{list.total_item_count} items</Text>
                                            </View>
                                            <Text style={styles.packingDepartment}>Department: {list.department}</Text>
                                            <Text style={styles.packingDate}>
                                                Created: {new Date(list.created_at).toLocaleDateString()}
                                            </Text>

                                            {/* Packing Items */}
                                            {list.items.length > 0 && (
                                                <View style={styles.itemsContainer}>
                                                    <Text style={styles.itemsTitle}>Packed Items:</Text>
                                                    {list.items.map((item) => (
                                                        <View key={item.id} style={styles.itemRow}>
                                                            <Text style={styles.itemName}>{item.item.name}</Text>
                                                            <Text style={styles.itemQuantity}>
                                                                {item.quantity} {item.item.unit} ({item.total_weight}kg)
                                                            </Text>
                                                            {item.notes && (
                                                                <Text style={styles.itemNotes}>Notes: {item.notes}</Text>
                                                            )}
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>No packing lists found</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Timestamps */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeline</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Created</Text>
                        <Text style={styles.infoValue}>{new Date(tracking.created_at).toLocaleString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Updated</Text>
                        <Text style={styles.infoValue}>{new Date(tracking.updated_at).toLocaleString()}</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F8FB',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F8FB',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    headerSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    quotationCode: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    poCode: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    prCode: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
    },
    infoRow: {
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: '#374151',
    },
    batchCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    batchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    batchNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    batchStatus: {
        fontSize: 12,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    batchRoutes: {
        fontSize: 14,
        color: '#374151',
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    orderItems: {
        fontSize: 12,
        color: '#6B7280',
    },
    orderDetails: {
        marginBottom: 8,
    },
    orderDetail: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    packingCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    packingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    packingCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    packingItems: {
        fontSize: 12,
        color: '#6B7280',
    },
    packingDepartment: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    packingDate: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    itemsContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    itemRow: {
        marginBottom: 6,
    },
    itemName: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    itemQuantity: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    itemNotes: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginTop: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
    },
    activeTabText: {
        color: '#1F2937',
        fontWeight: '600',
    },
    tabContent: {
        minHeight: 200,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});
