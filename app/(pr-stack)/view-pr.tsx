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

    const isRenderViewPr = purchaseRequest?.status === 'approved';

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
                <View style={styles.fixedFooter}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.declineButton}
                            onPress={() => handleActionButton('decline')}
                        >
                            <Text style={styles.declineButtonText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.approveButton}
                            onPress={() => handleActionButton('approve')}
                        >
                            <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        return null;
    };

    const renderViewPr = () => {
        if (isRenderViewPr) {
            return (
                <View style={styles.fixedFooter}>
                    <TouchableOpacity
                        style={styles.viewQuotationButton}
                        onPress={() => {
                            // const quotationCode = purchaseRequest.id;
                            // router.push({
                            //     pathname: '/(quotation-stack)/view-quotation',
                            //     params: { code: quotationCode }
                            // });
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.viewQuotationButtonText}>View Quotation</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <PRHeader purchaseRequest={purchaseRequest} />

                <PRSummary purchaseRequest={purchaseRequest} />

                <PRPricing purchaseRequest={purchaseRequest} />
                {/* Client Information */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Client Information</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Client Name</Text>
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
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Items ({purchaseRequest.items.length})</Text>
                    {purchaseRequest.items.map((item, index) => (
                        <CollapsibleItem key={index} item={item} index={index} destinationCode={purchaseRequest.destination_code} />
                    ))}
                </View>

                {/* Additional Information */}
                {purchaseRequest.reason && purchaseRequest.reason.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <View style={styles.card}>
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
            </ScrollView>

            {isAbleToApprove && renderApproveOrDeclineButton()}
            {renderViewPr()}

            <PRActionModal
                visible={modalVisible}
                onDismiss={handleModalDismiss}
                action={modalAction}
                onConfirm={handleModalConfirm}
                loading={isActionLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F6F8FB',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Space for fixed footer
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
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
    reasonText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        lineHeight: 20,
    },
    footer: {
        padding: 24,
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
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    approveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    declineButton: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DC2626',
        flex: 1,
    },
    declineButtonText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    viewQuotationButton: {
        backgroundColor: '#1976D2',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    viewQuotationButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
});   