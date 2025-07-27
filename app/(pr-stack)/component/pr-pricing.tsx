import { View, Text, StyleSheet } from "react-native";
import { formatCurrency } from "@/utils/CommonUtils";
import { PurchaseRequestDetail } from "@/types/PurchaseRequestTypes";

interface PRPricingProps {
    purchaseRequest: PurchaseRequestDetail;
}

export default function PRPricing({ purchaseRequest }: PRPricingProps) {
    return (
        <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Pricing Summary</Text>
            <View style={styles.pricingCard}>
                <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Items Total</Text>
                    <Text style={styles.pricingValue}>{formatCurrency(purchaseRequest.grand_total_item_price)}</Text>
                </View>
                <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Shipping</Text>
                    <Text style={styles.pricingValue}>{formatCurrency(purchaseRequest.grand_total_shipping_price)}</Text>
                </View>
                <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Additional Costs</Text>
                    <Text style={styles.pricingValue}>{formatCurrency(purchaseRequest.grand_total_additional_cost)}</Text>
                </View>
                <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Margin</Text>
                    <Text style={styles.pricingValue}>{formatCurrency(purchaseRequest.grand_total_margin_price)}</Text>
                </View>
                <View style={[styles.pricingRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalValue}>
                        {formatCurrency(
                            purchaseRequest.grand_total_item_price +
                            purchaseRequest.grand_total_shipping_price +
                            purchaseRequest.grand_total_additional_cost +
                            purchaseRequest.grand_total_margin_price
                        )}
                    </Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pricingSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    pricingCard: {
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    totalLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 14,
        color: '#1F2937',
    },
});