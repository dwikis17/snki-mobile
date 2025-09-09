import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tracking } from '@/types/TrackingTypes';

interface TrackingCardComponentProps {
    item: Tracking;
    onPress: () => void;
}

export default function TrackingCardComponent({ item, onPress }: TrackingCardComponentProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing':
                return '#F59E0B';
            case 'in_transit':
                return '#3B82F6';
            case 'partially_arrived':
                return '#8B5CF6';
            case 'completed':
                return '#10B981';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'preparing':
                return 'Preparing';
            case 'in_transit':
                return 'In Transit';
            case 'partially_arrived':
                return 'Partially Arrived';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'preparing':
                return '📦';
            case 'in_transit':
                return '🚚';
            case 'partially_arrived':
                return '📋';
            case 'completed':
                return '✅';
            case 'cancelled':
                return '❌';
            default:
                return '📦';
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.codeContainer}>
                    <Text style={styles.quotationCode}>{item.quotation_code}</Text>
                    <Text style={styles.poCode}>PO: {item.purchase_order_code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.clientName}>{item.client_name}</Text>
                <Text style={styles.destination}>📍 {item.destination_name}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Created</Text>
                    <Text style={styles.dateValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Updated</Text>
                    <Text style={styles.dateValue}>{new Date(item.updated_at).toLocaleDateString()}</Text>
                </View>
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    codeContainer: {
        flex: 1,
    },
    quotationCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 2,
    },
    poCode: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        marginBottom: 12,
    },
    clientName: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
        fontWeight: '500',
    },
    destination: {
        fontSize: 12,
        color: '#6B7280',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
    },
    dateContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateValue: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
});
