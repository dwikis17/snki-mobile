import { formatCurrency } from "@/utils/CommonUtils";
import { formatDate } from "@/utils/CommonUtils";
import { statusColor } from "@/utils/CommonUtils";
import { statusTextColor } from "@/utils/CommonUtils";
import { PurchaseRequestList } from "@/types/PurchaseRequestTypes";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface CardComponentProps {
    item: PurchaseRequestList;
    onPress?: (item: PurchaseRequestList) => void;
    showStatus?: boolean;
    showAmount?: boolean;
    showDate?: boolean;
    showCreatedBy?: boolean;
}

export default function CardComponent({
    item,
    onPress,
    showStatus = true,
    showAmount = true,
    showDate = true,
    showCreatedBy = true
}: CardComponentProps) {

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
                <Text style={styles.prCode}>{item.code}</Text>
                {showAmount && (
                    <Text style={styles.prAmount}>{formatCurrency(item.grand_total)}</Text>
                )}
            </View>
            <View style={styles.cardSubHeader}>
                {(showDate || showCreatedBy) && (
                    <Text style={styles.prDate}>
                        {showDate && formatDate(item.created_at)}
                        {showDate && showCreatedBy && ' - '}
                        {showCreatedBy && item.created_by}
                    </Text>
                )}
                {showStatus && (
                    <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                        <Text style={[styles.statusPillText, { color: statusTextColor(item.status) }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                )}
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
        marginHorizontal: 6,
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
    prCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    prAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
    },
    cardSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    prDate: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
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
});