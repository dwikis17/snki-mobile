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
                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Quantity:</Text>
                        <Text style={styles.itemValue}>{item.quantity} {item.item.unit}</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Unit Price:</Text>
                        <Text style={styles.itemValue}>{formatCurrency(item.item.price)}</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <Text style={styles.itemLabel}>Total Price:</Text>
                        <Text style={styles.itemValue}>{formatCurrency(item.item_price)}</Text>
                    </View>
                    {item.specification && (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>Specification:</Text>
                            <Text style={styles.itemValue}>{item.specification}</Text>
                        </View>
                    )}
                    {item.estimated_arrival && (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemLabel}>ETA:</Text>
                            <Text style={styles.itemValue}>{formatDate(item.estimated_arrival)}</Text>
                        </View>
                    )}

                    {/* Quotation-specific pricing information */}
                    {isQuotationItem && (
                        <>
                            <View style={styles.itemRow}>
                                <Text style={styles.itemLabel}>Unit Quoted Price:</Text>
                                <Text style={styles.itemValue}>{formatCurrency((item as QuotationItem).unit_quoted_price.quoted_price)}</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <Text style={styles.itemLabel}>Total Quoted Price:</Text>
                                <Text style={styles.itemValue}>{formatCurrency((item as QuotationItem).total_quoted_price.quoted_price)}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Shipping Information - Different for PR vs Quotation */}
                {item.shipping && item.shipping.length > 0 && (
                    <View style={styles.shippingSection}>
                        <Text style={styles.shippingTitle}>Shipping Details</Text>
                        {isQuotationItem ? (
                            // Quotation shipping details
                            (item as QuotationItem).shipping.map((ship, shipIndex) => (
                                <View key={shipIndex} style={styles.shippingItem}>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Method:</Text>
                                        <Text style={styles.shippingValue}>{ship.shipping_method_code}</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Service Type:</Text>
                                        <Text style={styles.shippingValue}>{ship.service_type}</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Origin:</Text>
                                        <Text style={styles.shippingValue}>{ship.origin_code}</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Destination:</Text>
                                        <Text style={styles.shippingValue}>{ship.destination_code}</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Price:</Text>
                                        <Text style={styles.shippingValue}>{formatCurrency(ship.price)}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            // Purchase Request shipping details
                            (item as PurchaseRequestItem).shipping.map((ship: any, shipIndex: number) => (
                                <View key={shipIndex} style={styles.shippingItem}>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Weight:</Text>
                                        <Text style={styles.shippingValue}>{ship.weight}kg</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Dimensions:</Text>
                                        <Text style={styles.shippingValue}>
                                            {ship.length}×{ship.width}×{ship.height}cm
                                        </Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Volumetric Weight:</Text>
                                        <Text style={styles.shippingValue}>{ship.volumetric_weight}kg</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Chargeable Weight:</Text>
                                        <Text style={styles.shippingValue}>{ship.chargeable_weight}g</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Shipping Cost:</Text>
                                        <Text style={styles.shippingValue}>{formatCurrency(ship.shipping_price)}</Text>
                                    </View>
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
    itemValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    shippingSection: {
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    shippingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    shippingItem: {
        marginBottom: 12,
    },
    shippingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    shippingLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    shippingValue: {
        fontSize: 14,
        color: '#1F2937',
    },
});