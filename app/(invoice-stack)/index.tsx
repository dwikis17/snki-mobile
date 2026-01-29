import { fetchInvoiceList } from '@/server-actions/InvoiceAction';
import { fetchBankList } from '@/server-actions/BankAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Invoice, InvoiceListResponse, InvoiceParams, InvoiceStatus } from '@/types/InvoiceTypes';
import { Bank } from '@/types/BankTypes';
import { useEffect, useState } from 'react';
import useDebounce from '@/hooks/use-debounce';
import SearchBar from '../components/search-bar';
import { STATUS_TABS } from '@/contants/invoice';
import TabBar from '../components/tab-bar';
import LoadingRefresh from '../components/loading-refresh';
import InvoiceCardComponent from '../components/invoice-card-component';
import { useRouter } from 'expo-router';

export default function InvoiceListScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | ''>('');
    const [allInvoiceData, setAllInvoiceData] = useState<Invoice[]>([]);
    const [filters, setFilters] = useState<InvoiceParams>({
        page,
        limit,
        status: selectedStatus as InvoiceStatus,
        invoice_code: search
    });
    const debouncedSearch = useDebounce(search, 1000);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            page,
            limit,
            status: selectedStatus as InvoiceStatus
        }));
    }, [selectedStatus, page, limit]);

    const { data, isLoading, refetch, isFetching } = useQuery<InvoiceListResponse, Error, InvoiceListResponse>({
        queryKey: ['invoice-list', page, limit, filters],
        queryFn: () => fetchInvoiceList(filters),
    });

    // Fetch bank list for mark as paid functionality
    const { data: bankData } = useQuery({
        queryKey: ['bank-list'],
        queryFn: () => fetchBankList(1, 100),
    });

    const meta = data?.meta;
    const invoiceData = data?.data || [];
    const pagination = meta?.pagination;

    // Accumulate data when new page loads
    useEffect(() => {
        if (invoiceData.length > 0) {
            if (page === 1) {
                setAllInvoiceData(invoiceData);
            } else {
                setAllInvoiceData(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = invoiceData.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAllInvoiceData([]);
        }
    }, [invoiceData, page]);

    useEffect(() => {
        // Reset page to 1 when search changes
        setPage(1);
        setFilters(prev => ({
            ...prev,
            invoice_code: debouncedSearch
        }))
    }, [debouncedSearch])

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1); // Reset to first page on refresh
        await refetch();
        setRefreshing(false);
    };

    const handleCardPress = (item: Invoice) => {
        router.push(`/(invoice-stack)/view-invoice?code=${item.code}`);
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
                setSelectedStatus={(status: string) => setSelectedStatus(status as InvoiceStatus)}
                setPage={setPage}
                tabList={STATUS_TABS}
            />
            {/* Invoice Cards */}
            <View style={{ marginTop: 8 }}>

                {allInvoiceData.length === 0 && !isFetching && (
                    <Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No invoices found.</Text>
                )}

                {allInvoiceData.map((item) => (
                    <InvoiceCardComponent
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
