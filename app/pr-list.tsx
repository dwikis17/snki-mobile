import { fetchPurchaseRequestList } from '@/server-actions/PurchaseRequestAction';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PurchaseRequestListResponse, PurchaseRequestParams, PurchaseRequestStatus } from '@/types/PurchaseRequestTypes';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import useDebounce from '@/hooks/use-debounce';

function formatCurrency(num: number) {
    return 'Rp' + num.toLocaleString('id-ID', { minimumFractionDigits: 2 });
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<PurchaseRequestStatus | ''>('');
    const [filters, setFilters] = useState<PurchaseRequestParams>({
        page,
        limit,
        status: selectedStatus as PurchaseRequestStatus,
        purchase_request_code: search
    });
    const debouncedSearch = useDebounce(search, 1000);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            page,
            limit,
            status: selectedStatus as PurchaseRequestStatus
        }));
    }, [selectedStatus, page, limit]);

    const { data, isLoading, refetch, isFetching } = useQuery<PurchaseRequestListResponse, Error, PurchaseRequestListResponse>({
        queryKey: ['purchase-request-list', page, limit, filters],
        queryFn: () => fetchPurchaseRequestList(filters),
    });

    const meta = data?.meta;
    const prData = data?.data || [];
    const pagination = meta?.pagination;

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            purchase_request_code: debouncedSearch
        }))
    }, [debouncedSearch])

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (isLoading && !prData.length) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 12 }}>Loading PR List...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#1976D2"]}
                    tintColor="#1976D2"
                />
            }
        >
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
                        onPress={() => {
                            setSelectedStatus(tab.key === 'all' ? '' : tab.key as PurchaseRequestStatus);
                            setStatusTab(tab.key);
                            setPage(1); // Reset page when changing tab
                        }}
                    >
                        <Text style={[styles.tabText, statusTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* PR Cards */}
            <View style={{ marginTop: 8 }}>
                {isFetching && !isLoading && (
                    <View style={{ alignItems: 'center', marginVertical: 12 }}>
                        <ActivityIndicator size="small" color="#1976D2" />
                        <Text style={{ color: '#1976D2', marginTop: 4 }}>Refreshing...</Text>
                    </View>
                )}
                {prData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No purchase requests found.</Text>
                )}
                {prData.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.prCode}>{item.code}</Text>
                            <Text style={styles.prAmount}>{formatCurrency(item.grand_total)}</Text>
                        </View>
                        <View style={styles.cardSubHeader}>
                            <Text style={styles.prDate}>{formatDate(item.created_at)} - {item.created_by}</Text>
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