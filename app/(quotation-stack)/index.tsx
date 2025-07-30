import { fetchQuotationList } from '@/server-actions/QuotationAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { QuotationList, QuotationListResponse, QuotationParams, QuotationStatus } from '@/types/QuotationTypes';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import useDebounce from '@/hooks/use-debounce';
import SearchBar from '../components/search-bar';
import TabBar from '../components/tab-bar';
import LoadingRefresh from '../components/loading-refresh';
import { useRouter } from 'expo-router';
import QuotationCardComponent from '../components/quotation-card-component';

const QUOTATION_STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'unqualified', label: 'Unqualified' },
];

export default function QuotationListScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<QuotationStatus | ''>('');
    const [filters, setFilters] = useState<QuotationParams>({
        page,
        limit,
        status: selectedStatus || undefined,
        quotation_code: search
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

    const { data, isLoading, refetch, isFetching } = useQuery<QuotationListResponse, Error, QuotationListResponse>({
        queryKey: ['quotation-list', page, limit, filters],
        queryFn: () => fetchQuotationList(filters),
    });

    const meta = data?.meta;
    const quotationData = data?.data || [];
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

    if (isLoading && !quotationData.length) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 12 }}>Loading Quotation List...</Text>
            </View>
        );
    }

    const handleCardPress = (item: QuotationList) => {
        router.push(`/(quotation-stack)/view-quotation?code=${item.code}`);
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
                setSelectedStatus={(status: string) => setSelectedStatus(status as 'pending' | 'qualified' | 'unqualified')}
                setPage={setPage}
                tabList={QUOTATION_STATUS_TABS}
            />
            {/* Quotation Cards */}
            <View style={{ marginTop: 8 }}>
                {isFetching && !isLoading && (
                    <LoadingRefresh isLoading={isFetching} />
                )}

                {quotationData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No quotations found.</Text>
                )}

                {quotationData.map((item) => (
                    <QuotationCardComponent
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