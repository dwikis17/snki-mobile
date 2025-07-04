import { fetchPurchaseRequestList } from '@/server-actions/PurchaseRequestAction';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PurchaseRequestListResponse } from '@/types/PurchaseRequestTypes';
import { useState } from 'react';
import { DataTable, Chip, ActivityIndicator } from 'react-native-paper';

function formatCurrency(num: number) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

function statusColor(status: string) {
    switch (status) {
        case 'approved': return '#4CAF50';
        case 'pending': return '#FFC107';
        case 'declined': return '#F44336';
        case 'draft': return '#90A4AE';
        default: return '#BDBDBD';
    }
}

export default function PRListScreen() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { data, isLoading } = useQuery<PurchaseRequestListResponse, Error, PurchaseRequestListResponse>({
        queryKey: ['purchase-request-list', page, limit],
        queryFn: () => fetchPurchaseRequestList({ page, limit }),
    });

    const meta = data?.meta;
    const prData = data?.data || [];
    const pagination = meta?.pagination;
    const metaData = meta?.meta_data;

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 12 }}>Loading PR List...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Purchase Request List</Text>
            {metaData && (
                <View style={styles.statusSummary}>
                    <Chip style={[styles.statusChip, { backgroundColor: statusColor('draft') }]}>Draft: {metaData.draft}</Chip>
                    <Chip style={[styles.statusChip, { backgroundColor: statusColor('pending') }]}>Pending: {metaData.pending}</Chip>
                    <Chip style={[styles.statusChip, { backgroundColor: statusColor('approved') }]}>Approved: {metaData.approved}</Chip>
                    <Chip style={[styles.statusChip, { backgroundColor: statusColor('declined') }]}>Declined: {metaData.declined}</Chip>
                </View>
            )}
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Code</DataTable.Title>
                    <DataTable.Title>Client</DataTable.Title>
                    <DataTable.Title>Destination</DataTable.Title>
                    <DataTable.Title numeric>Total Items</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                    <DataTable.Title numeric>Total</DataTable.Title>
                </DataTable.Header>
                {prData.length === 0 && (
                    <DataTable.Row>
                        <DataTable.Cell style={{ justifyContent: 'center', flex: 1 }}>
                            <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>No purchase requests found.</Text>
                        </DataTable.Cell>
                    </DataTable.Row>
                )}
                {prData.map((item) => (
                    <DataTable.Row key={item.id}>
                        <DataTable.Cell>{item.code}</DataTable.Cell>
                        <DataTable.Cell>{item.client_name}</DataTable.Cell>
                        <DataTable.Cell>{item.destination_name}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.total_item_count}</DataTable.Cell>
                        <DataTable.Cell>
                            <Chip style={{ backgroundColor: statusColor(item.status), alignSelf: 'center' }} textStyle={{ color: '#fff', fontWeight: 'bold' }}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Chip>
                        </DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency(item.grand_total)}</DataTable.Cell>
                    </DataTable.Row>
                ))}
                {pagination && (
                    <DataTable.Pagination
                        page={pagination.page - 1}
                        numberOfPages={pagination.total_pages}
                        onPageChange={setPage}
                        label={`Page ${pagination.page} of ${pagination.total_pages}`}
                        numberOfItemsPerPageList={[10, 20, 30, 40, 50]}
                        numberOfItemsPerPage={pagination.limit}
                        onItemsPerPageChange={setLimit}
                        showFastPaginationControls
                        selectPageDropdownLabel={'Rows per page'}
                    />
                )}
            </DataTable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 18,
        color: '#222',
        textAlign: 'center',
    },
    statusSummary: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        marginHorizontal: 4,
        marginBottom: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
}); 