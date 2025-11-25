import { fetchInvoiceByCode } from '@/server-actions/InvoiceAction';
import { fetchBankList } from '@/server-actions/BankAction';
import {
    View, Text, StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { InvoiceDetail } from '@/types/InvoiceTypes';
import { Bank } from '@/types/BankTypes';
import { useLocalSearchParams } from 'expo-router';
import { formatCurrency } from '@/utils/CommonUtils';
import { useState } from 'react';
import MarkPaidModal from './component/mark-paid-modal';

export default function ViewInvoiceScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [refreshing, setRefreshing] = useState(false);
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);

    const { data, isLoading, refetch, isFetching } = useQuery<InvoiceDetail, Error, InvoiceDetail>({
        queryKey: ['invoice-detail', code],
        queryFn: () => fetchInvoiceByCode(code!),
        enabled: !!code,
    });

    // Fetch bank list for mark as paid functionality
    const { data: bankData } = useQuery({
        queryKey: ['bank-list'],
        queryFn: () => fetchBankList(1, 100),
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
                <Text style={styles.loadingText}>Loading invoice...</Text>
            </View>
        );
    }

    if (!data?.data) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Invoice not found</Text>
            </View>
        );
    }

    const invoice = data.data;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return '#10B981';
            case 'unpaid':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Paid';
            case 'unpaid':
                return 'Unpaid';
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
                    <Text style={styles.invoiceCode}>{invoice.code}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                    </View>
                </View>
                <Text style={styles.quotationCode}>Quotation: {invoice.quotation_code}</Text>
                <Text style={styles.dueDate}>Due Date: {invoice.due_date}</Text>
                {invoice.paid_date && (
                    <Text style={styles.paidDate}>Paid Date: {invoice.paid_date}</Text>
                )}

                {/* Mark as Paid Button */}
                {invoice.status === 'unpaid' && bankData?.success && (
                    <TouchableOpacity
                        style={styles.markPaidButton}
                        onPress={() => setShowMarkPaidModal(true)}
                    >
                        <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Client Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Creator</Text>
                    <Text style={styles.infoValue}>{invoice.creator.name}</Text>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{invoice.creator.email}</Text>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{invoice.creator.phone}</Text>
                </View>
            </View>

            {/* Bank Account */}
            {invoice.bank_account && invoice.bank_account.id > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Account</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Bank Name</Text>
                        <Text style={styles.infoValue}>{invoice.bank_account.bank_name}</Text>
                        <Text style={styles.infoLabel}>Account Number</Text>
                        <Text style={styles.infoValue}>{invoice.bank_account.account_number}</Text>
                        <Text style={styles.infoLabel}>Account Name</Text>
                        <Text style={styles.infoValue}>{invoice.bank_account.account_name}</Text>
                    </View>
                </View>
            )}

            {/* Items Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({invoice.items.length})</Text>
                {invoice.items.map((item, index) => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemName}>{item.item.name}</Text>
                            <Text style={styles.itemCode}>{item.item.code}</Text>
                        </View>
                        <Text style={styles.itemSpec}>{item.specification}</Text>
                        <View style={styles.itemDetails}>
                            <View style={styles.itemDetailRow}>
                                <Text style={styles.itemDetailLabel}>Quantity:</Text>
                                <Text style={styles.itemDetailValue}>{item.quantity} {item.item.unit}</Text>
                            </View>
                            <View style={styles.itemDetailRow}>
                                <Text style={styles.itemDetailLabel}>Unit Price:</Text>
                                <Text style={styles.itemDetailValue}>{formatCurrency(item.item_price)}</Text>
                            </View>
                            <View style={styles.itemDetailRow}>
                                <Text style={styles.itemDetailLabel}>Total Price:</Text>
                                <Text style={styles.itemDetailValue}>{formatCurrency(item.total_price)}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Pricing Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing Summary</Text>
                <View style={styles.pricingCard}>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Sub Total</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(invoice.item_price)}</Text>
                    </View>
                    {invoice.is_taxed && (
                        <>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Tax ({invoice.tax_percent}%)</Text>
                                <Text style={styles.pricingValue}>{formatCurrency(invoice.tax_amount)}</Text>
                            </View>
                        </>
                    )}
                    <View style={[styles.pricingRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Price</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.total_price)}</Text>
                    </View>
                    <Text style={styles.priceWording}>{invoice.total_price_wording}</Text>
                </View>
            </View>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>
                    <View style={styles.infoCard}>
                        {invoice.notes && (
                            <>
                                <Text style={styles.infoLabel}>Notes</Text>
                                <Text style={styles.infoValue}>{invoice.notes}</Text>
                            </>
                        )}
                        {invoice.terms && (
                            <>
                                <Text style={styles.infoLabel}>Terms</Text>
                                <Text style={styles.infoValue}>{invoice.terms}</Text>
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* Mark as Paid Modal */}
            <MarkPaidModal
                visible={showMarkPaidModal}
                onClose={() => setShowMarkPaidModal(false)}
                invoice={invoice}
                bankList={bankData?.data?.data || []}
            />
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
    invoiceCode: {
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
    quotationCode: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    dueDate: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    paidDate: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '500',
        marginTop: 4,
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
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: '#374151',
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    itemCode: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemSpec: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 12,
    },
    itemDetails: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    itemDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemDetailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    itemDetailValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    pricingCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pricingLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    pricingValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    totalRow: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    priceWording: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    markPaidButton: {
        backgroundColor: '#10B981',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    markPaidButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
