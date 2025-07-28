import { formatCurrency } from "@/utils/CommonUtils";
import { formatDate } from "@/utils/CommonUtils";
import { statusColor } from "@/utils/CommonUtils";
import { statusTextColor } from "@/utils/CommonUtils";
import { PurchaseOrder } from "@/types/PurchaseOrderTypes";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface PurchaseOrderCardComponentProps {
    item: PurchaseOrder;
    onPress?: (item: PurchaseOrder) => void;
    showStatus?: boolean;
    showAmount?: boolean;
    showDate?: boolean;
    showCreatedBy?: boolean;
}

export default function PurchaseOrderCardComponent({
    item,
    onPress,
    showStatus = true,
    showAmount = true,
    showDate = true,
    showCreatedBy = true
}: PurchaseOrderCardComponentProps) {
    const handlePress = () => {
        if (onPress) {
            onPress(item);
        }
    };

    const CardContainer = onPress ? TouchableOpacity : View;

    return (
        <CardContainer
            key={item.id}
            style={styles.card}
            onPress={handlePress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.purchaseOrderCode}>{item.code}</Text>
                {showAmount && (
                    <Text style={styles.purchaseOrderAmount}>{formatCurrency(item.grand_total_price)}</Text>
                )}
            </View>
            <View style={styles.cardSubHeader}>
                <View style={styles.quotationInfo}>
                    <Text style={styles.quotationCode}>Quotation: {item.quotation_code}</Text>
                    {(showDate || showCreatedBy) && (
                        <Text style={styles.purchaseOrderDate}>
                            {showDate && formatDate(item.created_at)}
                            {showDate && showCreatedBy && ' - '}
                            {showCreatedBy && item.created_by}
                        </Text>
                    )}
                </View>
                {showStatus && (
                    <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                        <Text style={[styles.statusPillText, { color: statusTextColor(item.status) }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.cardDetails}>
                <Text style={styles.clientInfo}>Client: {item.client_name}</Text>
                <Text style={styles.destinationInfo}>Destination: {item.destination_name}</Text>
                <View style={styles.countsContainer}>
                    <Text style={styles.countText}>PO Subs: {item.total_purchase_order_sub_count}</Text>
                    <Text style={styles.countText}>Items: {item.total_item_count}</Text>
                    <Text style={styles.countText}>Providers: {item.provider_item_count}</Text>
                </View>
            </View>
        </CardContainer>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    purchaseOrderCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    purchaseOrderAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    cardSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    quotationInfo: {
        flex: 1,
    },
    quotationCode: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    purchaseOrderDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardDetails: {
        gap: 4,
    },
    clientInfo: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    destinationInfo: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    countsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    countText: {
        fontSize: 12,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
}); 