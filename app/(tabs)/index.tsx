import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform, View as RNView, LayoutChangeEvent } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { fetchStatistics, fetchTopItems } from '@/server-actions/ReportingAction';
import { StatisticsRequest, StatisticsResponse } from '@/types/ReportingTypes';
import dayjs from 'dayjs';
import DashboardOverviewCard from '@/components/dashboard/DashboardOverviewCard';
import PurchaseRequestQuotationChart from '@/components/dashboard/PurchaseRequestQuotationChart';
import PurchaseOrderChart from '@/components/dashboard/PurchaseOrderChart';
import ProfitTopItemsChart from '@/components/dashboard/ProfitTopItemsChart';
import InvoiceTrackingChart from '@/components/dashboard/InvoiceTrackingChart';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import FloatingTabBar from '@/components/dashboard/FloatingTabBar';

export default function TabOneScreen() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<StatisticsRequest>({
    date_range: "monthly",
    start_date: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    end_date: dayjs().format("YYYY-MM-DD"),
    items_order_by: "total_price",
    sections: ["overview", "charts", "expenses", "profit"]
  });

  const [topItemsOrderBy, setTopItemsOrderBy] = useState<string>("total_price");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionLayouts = useRef<{ [key: string]: number }>({});

  const { data: statisticsData, isLoading, error, refetch } = useQuery<StatisticsResponse, Error>({
    queryKey: ['dashboardStatistics', filters],
    queryFn: async () => {
      const response = await fetchStatistics(filters);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: topItemsResponse, isLoading: topItemsLoading, error: topItemsError, refetch: refetchTopItems } = useQuery({
    queryKey: ['topItems', filters.date_range, filters.start_date, filters.end_date, topItemsOrderBy],
    queryFn: async () => {
      const response = await fetchTopItems({
        date_range: filters.date_range,
        start_date: filters.start_date,
        end_date: filters.end_date,
        items_order_by: topItemsOrderBy as "quantity" | "total_price"
      });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const onRefresh = useCallback(() => {
    refetch();
    refetchTopItems();
  }, [refetch, refetchTopItems]);

  const handleDateChange = (event: any, selectedDate?: Date, type?: 'start' | 'end') => {
    if (Platform.OS === 'android') {
      if (type === 'start') setShowStartDatePicker(false);
      else setShowEndDatePicker(false);
    }

    if (selectedDate) {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      if (type === 'start') {
        setFilters(prev => ({ ...prev, start_date: dateStr }));
      } else {
        setFilters(prev => ({ ...prev, end_date: dateStr }));
      }
    }
  };

  const handleSectionLayout = (section: string, event: LayoutChangeEvent) => {
    sectionLayouts.current[section] = event.nativeEvent.layout.y;
  };

  const scrollToSection = (section: string) => {
    const y = sectionLayouts.current[section];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
      setActiveSection(section);
    }
  };

  const overviewData = statisticsData?.data.overview;
  const chartsData = statisticsData?.data.charts;
  const expensesData = statisticsData?.data.total_expenses;
  const profitData = statisticsData?.data.profit_loss;
  const topItemsData = topItemsResponse?.data;

  const sections = ['overview', 'charts', 'expenses', 'profit', 'top_items'];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          // Simple logic to update active section based on scroll position could be added here
          // For now, we just update it on click
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {user?.profile.name}</Text>
          <Text style={styles.dateText}>{dayjs().format('DD MMMM YYYY')}</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filter By</Text>
            <View style={styles.rangeButtons}>
              {['daily', 'weekly', 'monthly'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[styles.rangeButton, filters.date_range === range && styles.activeRangeButton]}
                  onPress={() => setFilters(prev => ({ ...prev, date_range: range as any }))}
                >
                  <Text style={[styles.rangeButtonText, filters.date_range === range && styles.activeRangeButtonText]}>
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Period</Text>
            <View style={styles.dateButtons}>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={styles.dateButtonText}>{dayjs(filters.start_date).format('DD MMM YYYY')}</Text>
              </TouchableOpacity>
              <Text style={styles.dateSeparator}>-</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={styles.dateButtonText}>{dayjs(filters.end_date).format('DD MMM YYYY')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date(filters.start_date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, date) => handleDateChange(e, date, 'start')}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={new Date(filters.end_date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, date) => handleDateChange(e, date, 'end')}
          />
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <RNView onLayout={(e) => handleSectionLayout('overview', e)}>
            <DashboardOverviewCard data={overviewData} isLoading={isLoading} />
          </RNView>

          <RNView onLayout={(e) => handleSectionLayout('charts', e)}>
            <PurchaseRequestQuotationChart
              data={chartsData}
              expenseData={expensesData}
              dateRange={filters}
              isLoading={isLoading}
            />
          </RNView>

          <RNView onLayout={(e) => handleSectionLayout('expenses', e)}>
            <PurchaseOrderChart
              data={chartsData?.purchase_order}
              expenseData={expensesData?.purchase_order}
              dateRange={filters}
              isLoading={isLoading}
            />
          </RNView>

          <RNView onLayout={(e) => handleSectionLayout('profit', e)}>
            <ProfitTopItemsChart
              profitData={profitData}
              topItemsData={topItemsData}
              dateRange={filters}
              isLoading={isLoading}
              topItemsLoading={topItemsLoading}
              topItemsOrderBy={topItemsOrderBy}
              onTopItemsOrderByChange={setTopItemsOrderBy}
            />
          </RNView>

          <RNView onLayout={(e) => handleSectionLayout('top_items', e)}>
            <InvoiceTrackingChart
              data={chartsData}
              dateRange={filters}
              isLoading={isLoading}
            />
          </RNView>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load statistics: {error.message}</Text>
          </View>
        )}
      </ScrollView>

      {/* <FloatingTabBar
        sections={sections}
        activeSection={activeSection}
        onPress={scrollToSection}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Add extra padding for floating tab bar
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 70,
  },
  rangeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
    flex: 1,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeRangeButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  rangeButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeRangeButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  dateButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    backgroundColor: 'transparent',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  dateSeparator: {
    color: '#9ca3af',
  },
  contentContainer: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
});
