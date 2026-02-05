import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OverviewData } from '@/types/ReportingTypes';
import { Ionicons } from '@expo/vector-icons';

interface DashboardOverviewCardProps {
    data?: OverviewData;
    isLoading?: boolean;
}

const DashboardOverviewCard: React.FC<DashboardOverviewCardProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <View style={styles.card}>
                <Text>Loading overview...</Text>
            </View>
        );
    }

    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    const renderItem = (label: string, item: any) => {
        if (!item) return null;

        const isPositive = item.trend === 'up';
        const isStable = item.trend === 'stable';
        const trendColor = isStable ? '#6b7280' : (isPositive ? '#16a34a' : '#dc2626');
        const trendIcon = isStable ? 'remove' : (isPositive ? 'arrow-up' : 'arrow-down');

        return (
            <View key={label} style={styles.item}>
                <Text style={styles.label}>{label.replace(/_/g, ' ')}</Text>
                <Text style={styles.value}>{item.current}</Text>
                <View style={styles.trendContainer}>
                    <Ionicons name={trendIcon} size={12} color={trendColor} />
                    <Text style={[styles.trendText, { color: trendColor }]}>
                        {Math.abs(item.change_rate).toFixed(1)}%
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Overview</Text>
            <View style={styles.grid}>
                {renderItem('Invoice', data.invoice)}
                {renderItem('Purchase Order', data.purchase_order)}
                {renderItem('Purchase Request', data.purchase_request)}
                {renderItem('Quotation', data.quotation)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1f2937',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    item: {
        width: '48%',
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default DashboardOverviewCard;
