import { fetchPurchaseRequestList } from '@/server-actions/PurchaseRequestAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PurchaseRequestList, PurchaseRequestListResponse, PurchaseRequestParams, PurchaseRequestStatus } from '@/types/PurchaseRequestTypes';
import { useEffect, useState, useRef } from 'react';
import useDebounce from '@/hooks/use-debounce';
import SearchBar from '../components/search-bar';
import { STATUS_TABS } from '@/contants/purchase-request';
import TabBar from '../components/tab-bar';
import LoadingRefresh from '../components/loading-refresh';
import CardComponent from '../components/card-component';
import { useRouter } from 'expo-router';

export default function PRListScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<PurchaseRequestStatus | ''>('');
    const [allPrData, setAllPrData] = useState<PurchaseRequestList[]>([]);
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

    // Accumulate data when new page loads
    useEffect(() => {
        if (prData.length > 0) {
            if (page === 1) {
                // Reset data on first page (filter/search change or refresh)
                setAllPrData(prData);
            } else {
                // Append data for subsequent pages
                setAllPrData(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = prData.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAllPrData([]);
        }
    }, [prData, page]);

    useEffect(() => {
        // Reset page to 1 when search changes
        setPage(1);
        setFilters(prev => ({
            ...prev,
            purchase_request_code: debouncedSearch
        }))
    }, [debouncedSearch])

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1); // Reset to first page on refresh
        await refetch();
        setRefreshing(false);
    };



    const handleCardPress = (item: PurchaseRequestList) => {
        router.push(`/(pr-stack)/view-pr?code=${item.code}`);
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing || isLoading}
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
                setSelectedStatus={(status: string) => setSelectedStatus(status as PurchaseRequestStatus)}
                setPage={setPage}
                tabList={STATUS_TABS}
            />
            {/* PR Cards */}
            <View style={{ marginTop: 8 }}>

                {allPrData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No purchase requests found.</Text>
                )}

                {allPrData.map((item) => (
                    <CardComponent
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