import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '@/utils/CommonUtils';
import { Invoice } from '@/types/InvoiceTypes';

interface InvoiceCardComponentProps {
    item: Invoice;
    onPress: () => void;
}

export default function InvoiceCardComponent({ item, onPress }: InvoiceCardComponentProps) {
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
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.code}>{item.code}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <Text style={styles.clientName}>{item.client_name}</Text>
            <Text style={styles.quotationCode}>Quotation: {item.quotation_code}</Text>

            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Total Price</Text>
                    <Text style={styles.priceValue}>{formatCurrency(item.total_price)}</Text>
                </View>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Due Date</Text>
                    <Text style={styles.dateValue}>{item.due_date}</Text>
                </View>
            </View>

            <View style={styles.itemCountContainer}>
                <Text style={styles.itemCountText}>{item.total_item_count} item(s)</Text>
            </View>
        </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    code: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    clientName: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    quotationCode: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    dateContainer: {
        alignItems: 'flex-end',
    },
    dateLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    itemCountContainer: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
    },
    itemCountText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});
