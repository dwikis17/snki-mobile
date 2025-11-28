import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ChartsData, ChartItem, StatisticsRequest } from '@/types/ReportingTypes';

const screenWidth = Dimensions.get('window').width;

interface InvoiceTrackingChartProps {
    data?: ChartsData;
    dateRange?: StatisticsRequest;
    isLoading?: boolean;
}

interface StackItem {
    color: string;
    value: number;
    name: string;
}

interface BarChartGroup {
    label: string;
    stacks: StackItem[];
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
            name: config[key].label,
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

    const [invoiceTooltip, setInvoiceTooltip] = React.useState<{ visible: boolean; x: number; y: number; label: string; stacks: StackItem[] }>({ visible: false, x: 0, y: 0, label: '', stacks: [] });
    const [trackingTooltip, setTrackingTooltip] = React.useState<{ visible: boolean; x: number; y: number; label: string; stacks: StackItem[] }>({ visible: false, x: 0, y: 0, label: '', stacks: [] });

    function onInvoiceBarPress(item: BarChartGroup, index: number, x: number, y: number) {
        setInvoiceTooltip({ visible: true, x: x ?? index * 40, y: y ?? 60, label: item.label, stacks: item.stacks });
        setTimeout(() => setInvoiceTooltip(t => ({ ...t, visible: false })), 3000);
    }

    function onTrackingBarPress(item: BarChartGroup, index: number, x: number, y: number) {
        setTrackingTooltip({ visible: true, x: x ?? index * 40, y: y ?? 60, label: item.label, stacks: item.stacks });
        setTimeout(() => setTrackingTooltip(t => ({ ...t, visible: false })), 3000);
    }

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
                            onPress={(item: any, index: number, event: any) => {
                                const x = event?.nativeEvent?.locationX;
                                const y = event?.nativeEvent?.locationY;
                                onInvoiceBarPress(item as BarChartGroup, index, x, y);
                            }}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        />
                        <Legend config={invoiceConfig} />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
                {invoiceTooltip.visible && (
                    <Animated.View style={[styles.tooltip, { left: invoiceTooltip.x, top: invoiceTooltip.y }]}>
                        <Text style={styles.tooltipLabel}>{invoiceTooltip.label}</Text>
                        {invoiceTooltip.stacks.map((stack, index) => (
                            stack.value > 0 && (
                                <View key={index} style={styles.tooltipRow}>
                                    <View style={[styles.tooltipColor, { backgroundColor: stack.color }]} />
                                    <Text style={styles.tooltipText}>{stack.name}: {stack.value}</Text>
                                </View>
                            )
                        ))}
                    </Animated.View>
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
                            onPress={(item: any, index: number, event: any) => {
                                const x = event?.nativeEvent?.locationX;
                                const y = event?.nativeEvent?.locationY;
                                onTrackingBarPress(item as BarChartGroup, index, x, y);
                            }}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        />
                        <Legend config={trackingConfig} />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
                {trackingTooltip.visible && (
                    <Animated.View style={[styles.tooltip, { left: trackingTooltip.x, top: trackingTooltip.y }]}>
                        <Text style={styles.tooltipLabel}>{trackingTooltip.label}</Text>
                        {trackingTooltip.stacks.map((stack, index) => (
                            stack.value > 0 && (
                                <View key={index} style={styles.tooltipRow}>
                                    <View style={[styles.tooltipColor, { backgroundColor: stack.color }]} />
                                    <Text style={styles.tooltipText}>{stack.name}: {stack.value}</Text>
                                </View>
                            )
                        ))}
                    </Animated.View>
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
    tooltip: {
        position: 'absolute',
        backgroundColor: '#1f2937',
        padding: 8,
        borderRadius: 4,
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    tooltipLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginVertical: 2,
    },
    tooltipColor: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    tooltipText: {
        color: 'white',
        fontSize: 11,
    }
});

export default InvoiceTrackingChart;
