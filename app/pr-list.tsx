import { fetchPurchaseRequestList } from '@/server-actions/PurchaseRequestAction';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PurchaseRequestListResponse } from '@/types/PurchaseRequestTypes';
import { useState } from 'react';
import { Chip, ActivityIndicator } from 'react-native-paper';

function formatCurrency(num: number) {
    return 'Rp' + num.toLocaleString('id-ID', { minimumFractionDigits: 2 });
}

function statusColor(status: string) {
    switch (status) {
        case 'approved': return '#E3F0FF';
        case 'pending': return '#FFF7D6';
        case 'declined': return '#FFE3E3';
        case 'rejected': return '#FFE3E3';
        case 'draft': return '#F4F6F8';
        default: return '#F4F6F8';
    }
}

function statusTextColor(status: string) {
    switch (status) {
        case 'approved': return '#1976D2';
        case 'pending': return '#B08800';
        case 'declined': return '#D32F2F';
        case 'rejected': return '#D32F2F';
        case 'draft': return '#607D8B';
        default: return '#607D8B';
    }
}

const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
];

export default function PRListScreen() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');

    const { data, isLoading, refetch, isFetching } = useQuery<PurchaseRequestListResponse, Error, PurchaseRequestListResponse>({
        queryKey: ['purchase-request-list', page, limit],
        queryFn: () => fetchPurchaseRequestList({ page, limit }),
    });

    const meta = data?.meta;
    const prData = data?.data || [];
    const pagination = meta?.pagination;
    const metaData = meta?.meta_data;

    // Filter by search and status
    const filteredData = prData.filter((item) => {
        const matchesSearch =
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            item.created_by?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusTab === 'all' ? true : item.status === statusTab;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 12 }}>Loading PR List...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search PR number or creator"
                    value={search}
                    onChangeText={setSearch}
                    clearButtonMode="while-editing"
                />
                {/* Filter icon placeholder */}
                <View style={styles.filterIcon} />
            </View>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {STATUS_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, statusTab === tab.key && styles.tabActive]}
                        onPress={() => setStatusTab(tab.key)}
                    >
                        <Text style={[styles.tabText, statusTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* PR Cards */}
            <View style={{ marginTop: 8 }}>
                {filteredData.length === 0 && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No purchase requests found.</Text>
                )}
                {filteredData.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.prCode}>{item.code}</Text>
                            <Text style={styles.prAmount}>{formatCurrency(item.grand_total)}</Text>
                        </View>
                        <View style={styles.cardSubHeader}>
                            <Text style={styles.prDate}>{item.created_at} - {item.created_by}</Text>
                            <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                                <Text style={[styles.statusPillText, { color: statusTextColor(item.status) }]}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
            {/* Pagination - Load More */}
            {pagination && pagination.page < pagination.total_pages && (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(page + 1)}>
                    <Text style={styles.loadMoreText}>{isFetching ? 'Loading...' : 'Load More'}</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#F6F8FB',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    searchBar: {
        flex: 1,
        height: 40,
        fontSize: 16,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 8,
    },
    filterIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        marginLeft: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#1976D2',
    },
    tabText: {
        color: '#757575',
        fontSize: 16,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#1976D2',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    prCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    prAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    cardSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    prDate: {
        color: '#6B7280',
        fontSize: 15,
    },
    statusPill: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    statusPillText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadMoreBtn: {
        marginTop: 12,
        alignSelf: 'center',
        backgroundColor: '#1976D2',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    loadMoreText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
}); 