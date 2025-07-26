import { STATUS_TABS } from "@/contants/purchase-request";
import { PurchaseRequestStatus } from "@/types/PurchaseRequestTypes";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TabBarProps {
    statusTab: string;
    setStatusTab: (status: string) => void;
    setSelectedStatus: (status: string) => void;
    setPage: (page: number) => void;
    tabList: { key: string, label: string }[];
}

export default function TabBar({
    statusTab,
    setStatusTab,
    setSelectedStatus,
    setPage,
    tabList
}: TabBarProps) {
    return (
        <View style={styles.tabsContainer}>
            {tabList.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, statusTab === tab.key && styles.tabActive]}
                    onPress={() => {
                        setSelectedStatus(tab.key === 'all' ? '' : tab.key as PurchaseRequestStatus);
                        setStatusTab(tab.key);
                        setPage(1); // Reset page when changing tab
                    }}
                >
                    <Text style={[styles.tabText, statusTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#F4F6F8',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#607D8B',
    },
    tabTextActive: {
        color: '#1976D2',
    },
    tabActive: {
        backgroundColor: '#E3F0FF',
    },
});