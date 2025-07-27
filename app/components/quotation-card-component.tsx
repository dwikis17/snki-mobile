import { formatCurrency } from "@/utils/CommonUtils";
import { formatDate } from "@/utils/CommonUtils";
import { statusColor } from "@/utils/CommonUtils";
import { statusTextColor } from "@/utils/CommonUtils";
import { QuotationList } from "@/types/QuotationTypes";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface QuotationCardComponentProps {
    item: QuotationList;
    onPress?: (item: QuotationList) => void;
    showStatus?: boolean;
    showAmount?: boolean;
    showDate?: boolean;
    showCreatedBy?: boolean;
}

export default function QuotationCardComponent({
    item,
    onPress,
    showStatus = true,
    showAmount = true,
    showDate = true,
    showCreatedBy = true
}: QuotationCardComponentProps) {
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
                <Text style={styles.quotationCode}>{item.code}</Text>
                {showAmount && (
                    <Text style={styles.quotationAmount}>{formatCurrency(item.total_price)}</Text>
                )}
            </View>
            <View style={styles.cardSubHeader}>
                <View style={styles.prInfo}>
                    <Text style={styles.prCode}>PR: {item.purchase_request_code}</Text>
                    {(showDate || showCreatedBy) && (
                        <Text style={styles.quotationDate}>
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
                <Text style={styles.itemCount}>Items: {item.total_item_count}</Text>
            </View>
        </CardContainer>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    quotationCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    quotationAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
    },
    cardSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    prInfo: {
        flex: 1,
    },
    prCode: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    quotationDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        minWidth: 80,
        alignItems: 'center',
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    cardDetails: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    clientInfo: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    destinationInfo: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    itemCount: {
        fontSize: 14,
        color: '#6B7280',
    },
}); 