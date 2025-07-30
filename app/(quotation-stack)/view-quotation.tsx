import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native-paper';
import { formatCurrency, formatDate, statusColor, statusTextColor } from "@/utils/CommonUtils";
import { QuotationDetail } from "@/types/QuotationTypes";
import { fetchQuotationByCode } from '@/server-actions/QuotationAction';
import CollapsibleItem from "../components/collapsible-item";

export default function ViewQuotation() {
    const { code } = useLocalSearchParams<{ code: string }>();

    const { data: quotation, isLoading, error } = useQuery<QuotationDetail | null>({
        queryKey: ['quotation-detail', code],
        queryFn: () => fetchQuotationByCode(code!),
        enabled: !!code,
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={styles.loadingText}>Loading quotation...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error loading quotation</Text>
                <Text style={styles.errorSubText}>{error.message}</Text>
            </View>
        );
    }

    if (!quotation) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Quotation not found</Text>
                <Text style={styles.errorSubText}>API integration pending</Text>
            </View>
        );
    }

    // TypeScript guard to ensure quotation is not null
    if (!quotation) return null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={styles.headerTop}>
                    <Text style={styles.quotationCode}>{quotation.code}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusColor(quotation.status) }]}>
                        <Text style={[styles.statusText, { color: statusTextColor(quotation.status) }]}>
                            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.createdBy}>Created by {quotation.creator.name}</Text>
                <Text style={styles.date}>{formatDate(quotation.created_at)}</Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Items</Text>
                        <Text style={styles.summaryValue}>{quotation.items.length}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Margin %</Text>
                        <Text style={styles.summaryValue}>{quotation.margin_percent}%</Text>
                    </View>
                </View>
            </View>

            {/* Pricing Summary */}
            <View style={styles.pricingSection}>
                <Text style={styles.sectionTitle}>Pricing Summary</Text>
                <View style={styles.pricingCard}>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Items Total</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(quotation.shipping_price)}</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Shipping</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(quotation.shipping_price)}</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Additional Costs</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(quotation.additional_cost)}</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Margin</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(quotation.margin_price)}</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Rounding Up</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(quotation.rounding_up)}</Text>
                    </View>
                    <View style={[styles.pricingRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(quotation.grand_total_price)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Client Information */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Client Name</Text>
                        <Text style={styles.infoValue}>{quotation.client.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{quotation.client.address}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{quotation.client.phone_office}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>PIC</Text>
                        <Text style={styles.infoValue}>{quotation.client.pic_name}</Text>
                    </View>
                </View>
            </View>


            {/* Destination Information */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Destination Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Destination</Text>
                        <Text style={styles.infoValue}>{quotation.destination.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Code</Text>
                        <Text style={styles.infoValue}>{quotation.destination.code}</Text>
                    </View>
                </View>
            </View>

            {/* Items Section */}
            <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Items ({quotation.items.length})</Text>
                {quotation.items.map((item, index) => (
                    <CollapsibleItem key={index} item={item} index={index} />
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Last updated: {formatDate(quotation.updated_at)}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8FB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    quotationCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    createdBy: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
    },
    summarySection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    pricingSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    pricingCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    pricingLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    pricingValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    totalRow: {
        borderBottomWidth: 0,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
    },
    infoSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        flex: 2,
        textAlign: 'right',
    },
    itemsSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    comingSoon: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 20,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 18,
        color: '#DC2626',
        textAlign: 'center',
    },
    errorSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
}); 