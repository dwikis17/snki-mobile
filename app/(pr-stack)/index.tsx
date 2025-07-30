import { fetchPurchaseRequestList } from '@/server-actions/PurchaseRequestAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PurchaseRequestList, PurchaseRequestListResponse, PurchaseRequestParams, PurchaseRequestStatus } from '@/types/PurchaseRequestTypes';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
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
                setSelectedStatus={(status: string) => setSelectedStatus(status as PurchaseRequestStatus)}
                setPage={setPage}
                tabList={STATUS_TABS}
            />
            {/* PR Cards */}
            <View style={{ marginTop: 8 }}>
                {isFetching && !isLoading && (
                    <LoadingRefresh isLoading={isFetching} />
                )}

                {prData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No purchase requests found.</Text>
                )}

                {prData.map((item) => (
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