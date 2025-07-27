import { formatDate, statusColor, statusTextColor } from "@/utils/CommonUtils";
import { View, StyleSheet, Text } from "react-native";
import { PurchaseRequestDetail } from "@/types/PurchaseRequestTypes";

interface PRHeaderProps {
    purchaseRequest: PurchaseRequestDetail;
}

export default function PRHeader({ purchaseRequest }: PRHeaderProps) {
    return (
        <View style={styles.headerSection}>
            <View style={styles.headerTop}>
                <Text style={styles.prCode}>{purchaseRequest.code}</Text>
                <View style={[styles.statusPill, { backgroundColor: statusColor(purchaseRequest.status) }]}>
                    <Text style={[styles.statusText, { color: statusTextColor(purchaseRequest.status) }]}>
                        {purchaseRequest.status.charAt(0).toUpperCase() + purchaseRequest.status.slice(1)}
                    </Text>
                </View>
            </View>
            <Text style={styles.createdBy}>Created by {purchaseRequest.created_by}</Text>
            <Text style={styles.date}>{formatDate(purchaseRequest.created_at)}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    headerSection: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    prCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    createdBy: {
        fontSize: 14,
        color: '#6B7280',
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
    },
});