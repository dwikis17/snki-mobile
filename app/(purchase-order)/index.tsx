import { fetchPurchaseOrderList } from '@/server-actions/PurchaseOrderAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PurchaseOrder, PurchaseOrderListResponse, PurchaseOrderParams, PurchaseOrderStatus } from '@/types/PurchaseOrderTypes';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import useDebounce from '@/hooks/use-debounce';
import SearchBar from '../components/search-bar';
import TabBar from '../components/tab-bar';
import { useRouter } from 'expo-router';
import PurchaseOrderCardComponent from '../components/purchase-order-card-component';

const PURCHASE_ORDER_STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Pending' },
    { key: 'purchased', label: 'Purchased' },
];

export default function PurchaseOrderListScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | ''>('');
    const [allPurchaseOrderData, setAllPurchaseOrderData] = useState<PurchaseOrder[]>([]);
    const [filters, setFilters] = useState<PurchaseOrderParams>({
        page,
        limit,
        status: selectedStatus || undefined,
        purchase_order_code: search
    });
    const debouncedSearch = useDebounce(search, 1000);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            page,
            limit,
            status: selectedStatus || undefined
        }));
    }, [selectedStatus, page, limit]);

    const { data, isLoading, refetch, isFetching } = useQuery<PurchaseOrderListResponse, Error, PurchaseOrderListResponse>({
        queryKey: ['purchase-order-list', page, limit, filters],
        queryFn: () => fetchPurchaseOrderList(filters),
    });

    const meta = data?.meta;
    const purchaseOrderData = data?.data || [];
    const pagination = meta?.pagination;

    // Accumulate data when new page loads
    useEffect(() => {
        if (purchaseOrderData.length > 0) {
            if (page === 1) {
                setAllPurchaseOrderData(purchaseOrderData);
            } else {
                setAllPurchaseOrderData(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = purchaseOrderData.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAllPurchaseOrderData([]);
        }
    }, [purchaseOrderData, page]);

    useEffect(() => {
        // Reset page to 1 when search changes
        setPage(1);
        setFilters(prev => ({
            ...prev,
            purchase_order_code: debouncedSearch
        }))
    }, [debouncedSearch])

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1); // Reset to first page on refresh
        await refetch();
        setRefreshing(false);
    };


    const handleCardPress = (item: PurchaseOrder) => {
        router.push(`/(purchase-order)/view-purchase-order?code=${item.code}`);
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
            <SearchBar search={search} setSearch={setSearch} />
            <TabBar
                statusTab={statusTab}
                setStatusTab={setStatusTab}
                setSelectedStatus={(status: string) => setSelectedStatus(status as 'draft' | 'pending' | 'purchased')}
                setPage={setPage}
                tabList={PURCHASE_ORDER_STATUS_TABS}
            />
            {/* Purchase Order Cards */}
            <View style={{ marginTop: 8 }}>

                {allPurchaseOrderData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No purchase orders found.</Text>
                )}

                {allPurchaseOrderData.map((item) => (
                    <PurchaseOrderCardComponent
                        key={item.id}
                        item={item}
                        onPress={() => handleCardPress(item)}
                    />

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
