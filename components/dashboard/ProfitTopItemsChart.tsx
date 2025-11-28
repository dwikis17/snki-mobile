import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Animated } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ProfitLossData, TopItem, StatisticsRequest } from '@/types/ReportingTypes';
import { formatCurrency } from '@/utils/CommonUtils';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface ProfitTopItemsChartProps {
    profitData?: ProfitLossData;
    topItemsData?: TopItem[];
    dateRange?: StatisticsRequest;
    isLoading?: boolean;
    topItemsLoading?: boolean;
    topItemsOrderBy?: string;
    onTopItemsOrderByChange?: (value: string) => void;
}

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

const ProfitTopItemsChart: React.FC<ProfitTopItemsChartProps> = ({
    profitData,
    topItemsData,
    dateRange,
    isLoading = false,
    topItemsLoading = false,
    topItemsOrderBy = "total_price",
    onTopItemsOrderByChange
}) => {
    if (isLoading) {
        return (
            <View style={styles.card}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const profitChartData = profitData?.charts?.map(item => ({
        value: item.data.sum,
        label: item.label,
        dataPointText: '',
    })) || [];

    const totalExpense = profitData?.total_expenses;

    const [tooltip, setTooltip] = React.useState<{ visible: boolean; x: number; y: number; label: string; value: number | null }>({ visible: false, x: 0, y: 0, label: '', value: null });

    function onPointPress(item: any, index: number, x: number, y: number) {
        setTooltip({ visible: true, x: x ?? index * 40, y: y ?? 60, label: item.label, value: item.value });
        setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 3000);
    }

    return (
        <View style={styles.container}>
            {/* Profit Chart */}
            <View style={styles.card}>
                <Text style={styles.title}>Profit Chart</Text>
                {profitChartData.length > 0 ? (
                    <View style={{ overflow: 'hidden' }}>
                        <LineChart
                            areaChart
                            data={profitChartData}
                            focusEnabled={true}
                            width={screenWidth - 150}
                            height={150}
                            spacing={200}
                            color="#8dd3c7"
                            startFillColor="#8dd3c7"
                            endFillColor="#8dd3c7"
                            startOpacity={0.6}
                            endOpacity={0.1}
                            initialSpacing={10}
                            noOfSections={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            yAxisTextStyle={{ color: 'black', fontSize: 10 }}
                            yAxisLabelWidth={100}
                            formatYLabel={(value) => formatCurrency(Number(value))}
                            xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                            onFocus={(item: any, index: number, event: any) => {
                                const x = event?.nativeEvent?.locationX;
                                const y = event?.nativeEvent?.locationY;
                                console.log("pressed")
                                onPointPress(item, index, x, y);
                            }}
                            showDataPointOnFocus={true}

                            curved
                        />
                    </View>
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
                {tooltip.visible && (
                    <Animated.View style={[styles.tooltip, { left: tooltip.x, top: tooltip.y }]}>
                        <Text style={styles.tooltipValue}>{formatCurrency(tooltip.value || 0)}</Text>
                        <Text style={styles.tooltipLabel}>{tooltip.label}</Text>
                    </Animated.View>
                )}
            </View>

            {/* Total Profit Card */}
            <View style={[styles.card, styles.expenseCard]}>
                <View style={styles.expenseHeader}>
                    <Text style={styles.expenseTitle}>Total Profit</Text>
                    <Text style={styles.expenseSubtitle}>{formatDateRange(dateRange)}</Text>
                </View>
                {totalExpense ? (
                    <>
                        <Text style={styles.expenseAmount}>{formatCurrency(totalExpense.current_total)}</Text>
                        <View style={styles.trendContainer}>
                            <Ionicons
                                name={totalExpense.trend === 'up' ? 'trending-up' : 'trending-down'}
                                size={16}
                                color={totalExpense.trend === 'up' ? '#4ade80' : '#f87171'}
                            />
                            <Text style={styles.trendText}>
                                {totalExpense.trend === 'up' ? 'increase' : 'decrease'} by {totalExpense.change_rate}% this period
                            </Text>
                        </View>
                    </>
                ) : (
                    <Text style={styles.noDataText}>No profit data available</Text>
                )}
            </View>

            {/* Top Items */}
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Top Items</Text>
                        <Text style={styles.subtitle}>Based on Quotation</Text>
                    </View>
                    {/* Filter Buttons */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterButton, topItemsOrderBy === 'quantity' && styles.activeFilter]}
                            onPress={() => onTopItemsOrderByChange?.('quantity')}
                        >
                            <Text style={[styles.filterText, topItemsOrderBy === 'quantity' && styles.activeFilterText]}>Qty</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, topItemsOrderBy === 'total_price' && styles.activeFilter]}
                            onPress={() => onTopItemsOrderByChange?.('total_price')}
                        >
                            <Text style={[styles.filterText, topItemsOrderBy === 'total_price' && styles.activeFilterText]}>Price</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {topItemsLoading ? (
                    <Text style={styles.loadingText}>Loading top items...</Text>
                ) : topItemsData && topItemsData.length > 0 ? (
                    <View style={styles.listContainer}>
                        {topItemsData.slice(0, 5).map((item, index) => (
                            <View key={item.item_code} style={styles.listItem}>
                                <Text style={styles.rank}>{index + 1}</Text>
                                <View style={styles.itemImageContainer}>
                                    {item.picture ? (
                                        <Image source={{ uri: item.picture }} style={styles.itemImage} />
                                    ) : (
                                        <View style={styles.placeholderImage}>
                                            <Ionicons name="image-outline" size={16} color="#9ca3af" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemCode}>{item.item_code}</Text>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
                                    <Text style={styles.itemMeta}>
                                        {item.quantity} Pcs • {formatCurrency(item.total_price)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noData}>No top items found</Text>
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
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
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
    noDataText: {
        color: '#94a3b8',
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 2,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    activeFilter: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    filterText: {
        fontSize: 12,
        color: '#6b7280',
    },
    activeFilterText: {
        color: '#1f2937',
        fontWeight: '500',
    },
    loadingText: {
        textAlign: 'center',
        color: '#6b7280',
        padding: 20,
    },
    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    rank: {
        width: 24,
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    itemImageContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
    },
    itemCode: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1f2937',
    },
    itemName: {
        fontSize: 12,
        color: '#4b5563',
        marginBottom: 2,
    },
    itemMeta: {
        fontSize: 11,
        color: '#6b7280',
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
        fontSize: 10,
        textAlign: 'center',
    }
});

export default ProfitTopItemsChart;
