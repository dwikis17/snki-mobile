import { PurchaseRequestDetail } from "@/types/PurchaseRequestTypes";
import { View, Text, StyleSheet } from "react-native";

interface PRSummaryProps {
    purchaseRequest: PurchaseRequestDetail;
}

export default function PRSummary({ purchaseRequest }: PRSummaryProps) {
    return (
        <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Items</Text>
                    <Text style={styles.summaryValue}>{purchaseRequest.items.length}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Margin %</Text>
                    <Text style={styles.summaryValue}>{purchaseRequest.margin_percent}%</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    summarySection: {
        padding: 16,
        backgroundColor: '#fff',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1F2937',
    },
});