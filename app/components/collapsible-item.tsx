import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useState, useRef } from "react";
import { PurchaseRequestItem } from "@/types/PurchaseRequestTypes";
import { formatCurrency, formatDate } from "@/utils/CommonUtils";
import { QuotationItem } from "@/types/QuotationTypes";



interface CollapsibleItemProps {
    item: PurchaseRequestItem | QuotationItem;
    index: number;
}

export default function CollapsibleItem({ item, index }: CollapsibleItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        Animated.timing(animatedHeight, {
            toValue: isExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    // Check if this is a QuotationItem by checking for quotation-specific properties
    const isQuotationItem = 'unit_quoted_price' in item;

    const calculateShippingPrice = (item: PurchaseRequestItem | QuotationItem) => {
        if (!item.shipping) return 0;

        if ('unit_quoted_price' in item) {
            return (item as QuotationItem).shipping[0].price
        }

        return (item as PurchaseRequestItem).shipping[0].shipping_price
    };

    const getAdditionalCost = (item: PurchaseRequestItem | QuotationItem) => {
        if ('unit_quoted_price' in item) {
            return (item as QuotationItem).additional_cost?.reduce((total, cost) => total + cost.additional_cost, 0) || 0;
        }

        return (item as PurchaseRequestItem).total_additional_cost || 0;
    };

    const getMarginPrice = (item: PurchaseRequestItem | QuotationItem) => {
        if ('unit_quoted_price' in item) {
            return (item as QuotationItem).unit_quoted_price.margin_price * item.quantity || 0;
        }

        return (item as PurchaseRequestItem).margin_price * item.quantity || 0;
    };

    return (
        <View style={styles.itemCard}>
            <TouchableOpacity
                style={styles.itemHeader}
                onPress={toggleExpanded}
                activeOpacity={0.7}
            >
                <View style={styles.itemHeaderContent}>
                    <Text style={styles.itemName}>{item.item.name}</Text>
                    <Text style={styles.itemCode}>{item.item.code}</Text>
                </View>
                <View style={styles.expandButton}>
                    <Text style={[styles.expandIcon, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
                        ▼
                    </Text>
                </View>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.collapsibleContent,
                    {
                        maxHeight: animatedHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1000], // Adjust based on content height
                        }),
                        opacity: animatedHeight,
                    }
                ]}
            >
                <View style={styles.itemDetails}>
                    {/* Header */}
                    <View style={{ gap: 0 }}>
                        <View style={styles.itemRow}>
                            <Text style={styles.quotedPriceLabel}>Quantity:</Text>
                            <Text style={styles.quotedPriceLabel}>{item.quantity} {item.item.unit}</Text>
                        </View>
                        {isQuotationItem && (
                            <View style={styles.itemRow}>
                                <Text style={styles.quotedPriceLabel}>Total Quoted Price:</Text>
                                <Text style={styles.quotedPriceLabel}>{formatCurrency((item as QuotationItem).total_quoted_price.quoted_price)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Detail */}
                    <View style={{ gap: 2 }}>
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>Detail:</Text>
                        </View>
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>Item Price:</Text>
                            <Text style={styles.itemValue}>{formatCurrency(item.item_price * item.quantity)}</Text>
                        </View>
                        {/* shipping price */}
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>Shipping Price:</Text>
                            <Text style={styles.itemValue}>{formatCurrency(calculateShippingPrice(item))}</Text>
                        </View>
                    </View>

                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Additional Cost:</Text>
                        <Text style={styles.itemValue}>{formatCurrency(getAdditionalCost(item))}</Text>
                    </View>

                    {/* margin price */}
                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Margin:</Text>
                        <Text style={styles.itemValue}>{formatCurrency(getMarginPrice(item))}</Text>
                    </View>
                </View>

                {/* Other Detail */}
                <View style={styles.itemDetails}>
                    <Text style={styles.sectionTitle}>Other Detail</Text>
                    {isQuotationItem && (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>Unit Quoted Price</Text>
                            <Text style={styles.itemValue}>
                                {formatCurrency((item as QuotationItem).unit_quoted_price.quoted_price)}/Unit
                            </Text>
                        </View>
                    )}
                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Source</Text>
                        <Text style={styles.itemValue}>{item.item.source}</Text>
                    </View>
                    {item.estimated_arrival && (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>ETA</Text>
                            <Text style={styles.itemValue}>{formatDate(item.estimated_arrival)}</Text>
                        </View>
                    )}
                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Notes</Text>
                        <Text style={styles.itemValue}>{item.specification || '-'}</Text>
                    </View>
                </View>

                {/* Shipping Detail */}
                {item.shipping && item.shipping.length > 0 && (
                    <View style={styles.itemDetails}>
                        <Text style={styles.sectionTitle}>Shipping Detail</Text>
                        {isQuotationItem ? (
                            // Quotation shipping details
                            (item as QuotationItem).shipping.map((ship, shipIndex) => (
                                <View key={shipIndex} style={styles.itemRow}>
                                    <Text style={styles.itemLabel}>
                                        {ship.origin_code} → {ship.destination_code} ({ship.service_type})
                                    </Text>
                                    <Text style={styles.itemValue}>{formatCurrency(ship.price)}</Text>
                                </View>
                            ))
                        ) : (
                            // Purchase Request shipping details
                            (item as PurchaseRequestItem).shipping.map((ship: any, shipIndex: number) => (
                                <View key={shipIndex} style={styles.itemRow}>
                                    <Text style={styles.itemLabel}>
                                        Shipping {shipIndex + 1} ({ship.weight}kg)
                                    </Text>
                                    <Text style={styles.itemValue}>{formatCurrency(ship.shipping_price)}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemCard: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    itemHeaderContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    itemCode: {
        fontSize: 12,
        color: '#6B7280',
    },
    expandButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandIcon: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: 'bold',
    },
    collapsibleContent: {
        overflow: 'hidden',
    },
    itemDetails: {
        padding: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    itemLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    quotedPriceLabel: {
        fontSize: 14,
        color: 'black',
        fontWeight: 'bold',
    },
    itemValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    sectionContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '500',
    },
});