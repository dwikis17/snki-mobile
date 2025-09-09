import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bank } from '@/types/BankTypes';
import { InvoiceDetail } from '@/types/InvoiceTypes';
import { markInvoiceAsPaid } from '@/server-actions/InvoiceAction';
import { useQueryClient } from '@tanstack/react-query';

interface MarkPaidModalProps {
    visible: boolean;
    onClose: () => void;
    invoice: InvoiceDetail['data'] | null;
    bankList: Bank[];
}

export default function MarkPaidModal({ visible, onClose, invoice, bankList }: MarkPaidModalProps) {
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [paidDate, setPaidDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async () => {
        if (!invoice || !selectedBankId || !paidDate) {
            Alert.alert('Error', 'Please select a bank and enter the paid date');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                id: invoice.id,
                quotation_id: invoice.quotation_id,
                status: 'paid' as const,
                paid_bank_account_id: parseInt(selectedBankId),
                paid_date: paidDate.toISOString().split('T')[0],
                due_date: invoice.due_date,
            };

            const result = await markInvoiceAsPaid(payload);

            if (result.success) {
                Alert.alert('Success', 'Invoice marked as paid successfully', [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Invalidate and refetch invoice data
                            queryClient.invalidateQueries({ queryKey: ['invoice-detail', invoice.code] });
                            queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
                            onClose();
                            resetForm();
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to mark invoice as paid');
            }
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedBankId('');
        setPaidDate(new Date());
        setShowDatePicker(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || paidDate;
        setPaidDate(currentDate);

        // On Android, close the picker after selection
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Mark Invoice as Paid</Text>
                            <Text style={styles.invoiceCode}>{invoice?.code}</Text>
                        </View>

                        <Text style={styles.description}>
                            This will change the invoice status to Paid. Make sure all payments have been completed.
                        </Text>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bank Account *</Text>
                                <ScrollView style={styles.bankList} nestedScrollEnabled>
                                    {bankList.map((bank) => (
                                        <TouchableOpacity
                                            key={bank.id}
                                            style={[
                                                styles.bankItem,
                                                selectedBankId === bank.id.toString() && styles.selectedBankItem
                                            ]}
                                            onPress={() => setSelectedBankId(bank.id.toString())}
                                        >
                                            <Text style={styles.bankName}>{bank.bank_name}</Text>
                                            <Text style={styles.bankAccount}>{bank.account_name}</Text>
                                            <Text style={styles.bankNumber}>{bank.account_number}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Paid Date *</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {formatDate(paidDate)}
                                    </Text>
                                    <Text style={styles.dateButtonHint}>Tap to change date</Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <View style={styles.datePickerContainer}>
                                        <DateTimePicker
                                            value={paidDate}
                                            mode="date"
                                            onChange={handleDateChange}
                                            style={styles.datePicker}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={isSubmitting || !selectedBankId}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Mark as Paid</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 20,
        maxHeight: '80%',
        width: '90%',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    invoiceCode: {
        fontSize: 16,
        color: '#6B7280',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        lineHeight: 20,
    },
    form: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    bankList: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
    bankItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    selectedBankItem: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    bankName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    bankAccount: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    bankNumber: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    dateButtonText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    dateButtonHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        fontStyle: 'italic',
    },
    datePickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        padding: 12,
        marginTop: 8,
    },
    datePicker: {
        width: '50%',
        height: Platform.OS === 'ios' ? 200 : 50,
        backgroundColor: '#fff',
        color: '#000',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#10B981',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
