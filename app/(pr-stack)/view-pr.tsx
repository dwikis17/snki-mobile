import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { approvePurchaseRequest, fetchPurchaseRequestByCode } from '@/server-actions/PurchaseRequestAction';
import { ActivityIndicator } from 'react-native-paper';
import { formatDate } from "@/utils/CommonUtils";
import CollapsibleItem from "@/app/components/collapsible-item";
import PRHeader from "./component/pr-header";
import PRSummary from "./component/pr-summary";
import PRPricing from "./component/pr-pricing";
import PRActionModal from "./component/pr-action-modal";
import { ApprovePurchaseRequest, PurchaseRequestDetail } from "@/types/PurchaseRequestTypes";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";

export default function ViewPR() {
    const { code } = useLocalSearchParams<{ code: string }>();

    const authData = useAuthStore((state) => state.user)
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState<'approve' | 'decline' | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const isAbleToApprove = authData?.frontend_path.includes("/pr-approval/:prId")

    const handleActionButton = (action: 'approve' | 'decline') => {
        setModalAction(action);
        setModalVisible(true);
    };

    const handleModalConfirm = async (reason?: string, declineType?: 'decline' | 'decline_to_draft') => {
        setIsActionLoading(true);
        try {
            if (modalAction === 'approve') {
                const payload = {
                    status: 'approved',
                }
                await approvePurchaseRequest(code!, payload as ApprovePurchaseRequest);

            } else if (modalAction === 'decline') {
                const status = declineType === 'decline_to_draft' ? 'draft' : 'declined';
                const payload = {
                    status: status,
                    reason: reason,
                }
                await approvePurchaseRequest(code!, payload as ApprovePurchaseRequest);
            }
        } catch (error) {
            console.error('Error processing action:', error);
        } finally {
            setIsActionLoading(false);
            setModalVisible(false);
            setModalAction(null);
            router.push('/');
        }
    };

    const handleModalDismiss = () => {
        setModalVisible(false);
        setModalAction(null);
    };

    const { data: purchaseRequest, isLoading, error } = useQuery<PurchaseRequestDetail, Error>({
        queryKey: ['purchase-request-detail', code],
        queryFn: () => fetchPurchaseRequestByCode(code!),
        enabled: !!code,
    });

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={styles.loadingText}>Loading purchase request...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error loading purchase request</Text>
                <Text style={styles.errorSubText}>{error.message}</Text>
            </View>
        );
    }

    if (!purchaseRequest) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Purchase request not found</Text>
            </View>
        );
    }


    const renderApproveOrDeclineButton = () => {
        if (purchaseRequest.status === 'pending') {
            return (
                <View style={[styles.centered, { flexDirection: 'row', gap: 16 }]}>
                    <TouchableOpacity
                        style={[styles.declineButton]}
                        onPress={() => handleActionButton('decline')}
                    >
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.approveButton]}
                        onPress={() => handleActionButton('approve')}
                    >
                        <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <PRHeader purchaseRequest={purchaseRequest} />

                <PRSummary purchaseRequest={purchaseRequest} />

                <PRPricing purchaseRequest={purchaseRequest} />
                {/* Client Information */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Client Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Client ID</Text>
                            <Text style={styles.infoValue}>{purchaseRequest.client_id}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{purchaseRequest.client_address}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Destination</Text>
                            <Text style={styles.infoValue}>{purchaseRequest.destination_code}</Text>
                        </View>
                        {purchaseRequest.reviewed_by && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Reviewed by</Text>
                                <Text style={styles.infoValue}>{purchaseRequest.reviewed_by}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Items Section */}
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionTitle}>Items ({purchaseRequest.items.length})</Text>
                    {purchaseRequest.items.map((item, index) => (
                        <CollapsibleItem key={index} item={item} index={index} />
                    ))}
                </View>

                {/* Additional Information */}
                {purchaseRequest.reason && purchaseRequest.reason.length > 0 && (
                    <View style={styles.reasonSection}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <View style={styles.reasonCard}>
                            {purchaseRequest.reason.map((reason, index) => (
                                <Text key={index} style={styles.reasonText}>
                                    {reason.reason}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Last updated: {formatDate(purchaseRequest.updated_at)}
                    </Text>
                </View>
                {isAbleToApprove && renderApproveOrDeclineButton()}
            </ScrollView>

            <PRActionModal
                visible={modalVisible}
                onDismiss={handleModalDismiss}
                action={modalAction}
                onConfirm={handleModalConfirm}
                loading={isActionLoading}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8FB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    prCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    createdBy: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
    },
    summarySection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemsSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    pricingSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    pricingCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    pricingLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    pricingValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    totalRow: {
        borderBottomWidth: 0,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
    },
    infoSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        flex: 2,
        textAlign: 'right',
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
        flex: 1,
    },
    itemValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        flex: 2,
        textAlign: 'right',
    },
    shippingSection: {
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    shippingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    shippingItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    shippingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    shippingLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    shippingValue: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
    },
    reasonSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    reasonCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reasonText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 18,
        color: '#DC2626',
        textAlign: 'center',
    },
    errorSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    approveButton: {
        backgroundColor: '#059669',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    declineButton: {
        backgroundColor: '#DC2626',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    declineButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});   