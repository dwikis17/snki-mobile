import { fetchTrackingList } from '@/server-actions/TrackingAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Tracking, TrackingListResponse, TrackingParams, TrackingStatus } from '@/types/TrackingTypes';
import { useEffect, useState } from 'react';
import useDebounce from '@/hooks/use-debounce';
import SearchBar from '../components/search-bar';
import { STATUS_TABS } from '@/contants/tracking';
import TabBar from '../components/tab-bar';
import LoadingRefresh from '../components/loading-refresh';
import TrackingCardComponent from '../components/tracking-card-component';
import { useRouter } from 'expo-router';

export default function TrackingListScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TrackingStatus | ''>('');
    const [filters, setFilters] = useState<TrackingParams>({
        page,
        limit,
        status: selectedStatus as TrackingStatus,
        quotation_code: search
    });
    const debouncedSearch = useDebounce(search, 1000);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            page,
            limit,
            status: selectedStatus as TrackingStatus
        }));
    }, [selectedStatus, page, limit]);

    const { data, isLoading, refetch, isFetching } = useQuery<TrackingListResponse, Error, TrackingListResponse>({
        queryKey: ['tracking-list', page, limit, filters],
        queryFn: () => fetchTrackingList(filters),
    });

    const meta = data?.meta;
    const trackingData = data?.data || [];
    const pagination = meta?.pagination;

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            quotation_code: debouncedSearch
        }))
    }, [debouncedSearch])

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleCardPress = (item: Tracking) => {
        router.push(`/(tracking-stack)/view-tracking?code=${item.quotation_code}`);
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
                setSelectedStatus={(status: string) => setSelectedStatus(status as TrackingStatus)}
                setPage={setPage}
                tabList={STATUS_TABS}
            />
            {/* Tracking Cards */}
            <View style={{ marginTop: 8 }}>

                {trackingData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No tracking records found.</Text>
                )}

                {trackingData.map((item) => (
                    <TrackingCardComponent
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
