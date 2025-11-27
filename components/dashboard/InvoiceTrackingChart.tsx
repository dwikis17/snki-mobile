import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ChartsData, ChartItem, StatisticsRequest } from '@/types/ReportingTypes';

const screenWidth = Dimensions.get('window').width;

interface InvoiceTrackingChartProps {
    data?: ChartsData;
    dateRange?: StatisticsRequest;
    isLoading?: boolean;
}

const invoiceConfig = {
    unpaid: { label: "Unpaid", color: "#f59e0b" },
    paid: { label: "Paid", color: "#22c55e" },
};

const trackingConfig = {
    preparing: { label: "Planned", color: "#6b7280" },
    in_transit: { label: "In-transit", color: "#f59e0b" },
    partially_arrived: { label: "Partially Arrived", color: "#fb923c" },
    completed: { label: "Completed", color: "#22c55e" },
    cancelled: { label: "Cancelled", color: "#ef4444" },
};

const transformToStackData = (data: ChartItem[], keys: string[], config: any) => {
    return data.map(item => ({
        label: item.label,
        stacks: keys.map(key => ({
            value: item.data[key] || 0,
            color: config[key].color,
        })),
    }));
};

const Legend = ({ config }: { config: any }) => (
    <View style={styles.legendContainer}>
        {Object.entries(config).map(([key, item]: [string, any]) => (
            <View key={key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
            </View>
        ))}
    </View>
);

const InvoiceTrackingChart: React.FC<InvoiceTrackingChartProps> = ({
    data,
    dateRange,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <View style={styles.card}>
                <Text>Loading charts...</Text>
            </View>
        );
    }

    const invoiceData = data?.invoice ? transformToStackData(data.invoice, ['unpaid', 'paid'], invoiceConfig) : [];
    const trackingData = data?.tracking ? transformToStackData(data.tracking, ['preparing', 'in_transit', 'partially_arrived', 'completed', 'cancelled'], trackingConfig) : [];

    return (
        <View style={styles.container}>
            {/* Invoice Chart */}
            <View style={styles.card}>
                <Text style={styles.title}>Invoice Chart</Text>
                {invoiceData.length > 0 ? (
                    <View style={{ overflow: 'hidden' }}>
                        <BarChart
                            stackData={invoiceData}
                            width={screenWidth - 80}
                            height={200}
                            barWidth={20}
                            spacing={30}
                            noOfSections={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        />
                        <Legend config={invoiceConfig} />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
            </View>

            {/* Tracking Chart */}
            <View style={styles.card}>
                <Text style={styles.title}>Tracking Chart</Text>
                {trackingData.length > 0 ? (
                    <View style={{ overflow: 'hidden' }}>
                        <BarChart
                            stackData={trackingData}
                            width={screenWidth - 80}
                            height={200}
                            barWidth={20}
                            spacing={30}
                            noOfSections={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        />
                        <Legend config={trackingConfig} />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1f2937',
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 12,
        color: '#4b5563',
    },
    noData: {
        textAlign: 'center',
        color: '#9ca3af',
        padding: 20,
    },
});

export default InvoiceTrackingChart;
