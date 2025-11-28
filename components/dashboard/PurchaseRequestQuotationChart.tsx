import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ChartsData, ChartItem, TotalExpenses, StatisticsRequest } from '@/types/ReportingTypes';
import { formatCurrency } from '@/utils/CommonUtils';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface PurchaseRequestQuotationChartProps {
    data?: ChartsData;
    expenseData?: TotalExpenses;
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

const purchaseRequestConfig = {
    draft: { label: "Draft", color: "#6b7280" },
    approved: { label: "Approved", color: "#16a34a" },
    pending: { label: "Ongoing", color: "#f59e0b" },
    declined: { label: "Declined", color: "#dc2626" },
};

const quotationConfig = {
    pending: { label: "Pending", color: "#f59e0b" },
    qualified: { label: "Qualified", color: "#16a34a" },
    unqualified: { label: "Unqualified", color: "#dc2626" },
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

const formatDateRange = (dateRange?: StatisticsRequest) => {
    if (!dateRange?.start_date || !dateRange?.end_date) {
        return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const startDate = new Date(dateRange.start_date);
    const endDate = new Date(dateRange.end_date);
    if (startDate.toDateString() === endDate.toDateString()) {
        return startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return `${startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
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

const PurchaseRequestQuotationChart: React.FC<PurchaseRequestQuotationChartProps> = ({
    data,
    expenseData,
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

    const [prTooltip, setPrTooltip] = React.useState<{ visible: boolean; x: number; y: number; label: string; stacks: StackItem[] }>({ visible: false, x: 0, y: 0, label: '', stacks: [] });
    const [quotationTooltip, setQuotationTooltip] = React.useState<{ visible: boolean; x: number; y: number; label: string; stacks: StackItem[] }>({ visible: false, x: 0, y: 0, label: '', stacks: [] });

    const prData = data?.purchase_request ? transformToStackData(data.purchase_request, ['draft', 'pending', 'approved', 'declined'], purchaseRequestConfig) : [];
    const quotationData = data?.quotation ? transformToStackData(data.quotation, ['pending', 'qualified', 'unqualified'], quotationConfig) : [];

    const combinedExpense = expenseData?.quotation;

    function onPrBarPress(item: BarChartGroup, index: number, x: number, y: number) {
        setPrTooltip({ visible: true, x: x ?? index * 40, y: y ?? 60, label: item.label, stacks: item.stacks });
        setTimeout(() => setPrTooltip(t => ({ ...t, visible: false })), 3000);
    }

    function onQuotationBarPress(item: BarChartGroup, index: number, x: number, y: number) {
        setQuotationTooltip({ visible: true, x: x ?? index * 40, y: y ?? 60, label: item.label, stacks: item.stacks });
        setTimeout(() => setQuotationTooltip(t => ({ ...t, visible: false })), 3000);
    }


    return (
        <View style={styles.container}>
            {/* Purchase Request Chart */}
            <View style={styles.card}>
                <Text style={styles.title}>Purchase Request Chart</Text>
                {prData.length > 0 ? (
                    <View style={{ overflow: 'hidden' }}>
                        <BarChart
                            stackData={prData}
                            width={screenWidth - 80}
                            height={200}
                            barWidth={20}
                            spacing={30}
                            noOfSections={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            onPress={(item: any, index: number, event: any) => {
                                // if event has nativeEvent.locationX you can compute position
                                const x = event?.nativeEvent?.locationX;
                                const y = event?.nativeEvent?.locationY;
                                onPrBarPress(item as BarChartGroup, index, x, y);
                            }}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        />
                        <Legend config={purchaseRequestConfig} />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
                {prTooltip.visible && (
                    <Animated.View style={[styles.tooltip, { left: prTooltip.x, top: prTooltip.y }]}>
                        <Text style={styles.tooltipLabel}>{prTooltip.label}</Text>
                        {prTooltip.stacks.map((stack, index) => (
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

            {/* Quotation Chart */}
            <View style={styles.card}>
                <Text style={styles.title}>Quotation Chart</Text>
                {quotationData.length > 0 ? (
                    <View style={{ overflow: 'hidden' }}>
                        <BarChart
                            stackData={quotationData}
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
                                onQuotationBarPress(item as BarChartGroup, index, x, y);
                            }}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                        />
                        <Legend config={quotationConfig} />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
                {quotationTooltip.visible && (
                    <Animated.View style={[styles.tooltip, { left: quotationTooltip.x, top: quotationTooltip.y }]}>
                        <Text style={styles.tooltipLabel}>{quotationTooltip.label}</Text>
                        {quotationTooltip.stacks.map((stack, index) => (
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

            {/* Expense Section */}
            <View style={[styles.card, styles.expenseCard]}>
                <View style={styles.expenseHeader}>
                    <Text style={styles.expenseTitle}>Total Quotation Value</Text>
                    <Text style={styles.expenseSubtitle}>Includes Pending & Qualified</Text>
                </View>
                {combinedExpense ? (
                    <>
                        <Text style={styles.expenseAmount}>{formatCurrency(combinedExpense.current_total)}</Text>
                        <View style={styles.trendContainer}>
                            <Ionicons
                                name={combinedExpense.trend === 'up' ? 'trending-up' : 'trending-down'}
                                size={16}
                                color={combinedExpense.trend === 'up' ? '#4ade80' : '#f87171'}
                            />
                            <Text style={styles.trendText}>
                                {combinedExpense.trend === 'up' ? 'increase' : 'decrease'} by {combinedExpense.change_rate}% this period
                            </Text>
                        </View>
                        <Text style={styles.dateRange}>{formatDateRange(dateRange)}</Text>
                    </>
                ) : (
                    <Text style={styles.noDataText}>No expense data available</Text>
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
    expenseCard: {
        backgroundColor: '#1e293b',
    },
    expenseHeader: {
        marginBottom: 12,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    expenseSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    expenseAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trendText: {
        color: '#cbd5e1',
        fontSize: 12,
    },
    dateRange: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 4,
    },
    noDataText: {
        color: '#94a3b8',
        textAlign: 'center',
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
    tooltipValue: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
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

export default PurchaseRequestQuotationChart;
