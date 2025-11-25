import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions, Modal, Keyboard } from 'react-native';
import { Text, Button, TextInput as PaperTextInput, Provider, RadioButton } from 'react-native-paper';
import Colors from '@/constants/Colors';

interface QuotationActionModalProps {
    visible: boolean;
    onDismiss: () => void;
    action: 'approve' | 'decline' | null;
    onConfirm: (reason?: string, declineType?: 'unqualified' | 'unqualified_draft', poNumber?: string) => void;
    loading?: boolean;
}

export default function QuotationActionModal({
    visible,
    onDismiss,
    action,
    onConfirm,
    loading = false
}: QuotationActionModalProps) {
    const [reason, setReason] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [declineType, setDeclineType] = useState<'unqualified' | 'unqualified_draft'>('unqualified');


    const handleConfirm = () => {
        if (action === 'decline' && !reason.trim()) {
            return; // Don't proceed if decline reason is empty
        }
        if (action === 'approve' && !poNumber.trim()) {
            return; // Don't proceed if PO number is empty
        }
        Keyboard.dismiss();
        onConfirm(action === 'decline' ? reason : undefined, action === 'decline' ? declineType : undefined, action === 'approve' ? poNumber : undefined);
        setReason(''); // Reset reason when modal is closed
        setPoNumber(''); // Reset PO number when modal is closed
        setDeclineType('unqualified'); // Reset decline type when modal is closed
    };

    const handleDismiss = () => {
        Keyboard.dismiss();
        setReason(''); // Reset reason when modal is dismissed
        setPoNumber(''); // Reset PO number when modal is dismissed
        setDeclineType('unqualified'); // Reset decline type when modal is dismissed
        onDismiss();
    };

    const isDecline = action === 'decline';
    const isApprove = action === 'approve';

    if (!visible) return null;

    return (
        <Provider>
            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleDismiss}
            >
                <TouchableWithoutFeedback onPress={() => {
                    Keyboard.dismiss();
                    handleDismiss();
                }}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                            <View style={styles.modalContainer}>
                                <View style={styles.content}>
                                    <Text style={styles.title}>
                                        {isApprove ? 'Approve Quotation' : 'Decline Quotation'}
                                    </Text>

                                    <Text style={styles.message}>
                                        {isApprove
                                            ? 'Please enter the PO Number to approve this quotation.'
                                            : 'Please provide a reason for declining this quotation.'
                                        }
                                    </Text>

                                    {isApprove && (
                                        <PaperTextInput
                                            mode="outlined"
                                            label="PO Number"
                                            value={poNumber}
                                            onChangeText={setPoNumber}
                                            style={styles.reasonInput}
                                            placeholder="Enter PO Number..."
                                            error={isApprove && !poNumber.trim()}
                                            textColor="black"
                                        />
                                    )}

                                    {isDecline && (
                                        <>
                                            <View style={styles.declineTypeContainer}>
                                                <Text style={styles.declineTypeLabel}>Status:</Text>
                                                <RadioButton.Group onValueChange={value => setDeclineType(value as 'unqualified' | 'unqualified_draft')} value={declineType}>
                                                    <View style={styles.radioOption}>
                                                        <RadioButton value="unqualified" />
                                                        <Text style={styles.radioLabel}>Unqualified</Text>
                                                    </View>
                                                    <View style={styles.radioOption}>
                                                        <RadioButton value="unqualified_draft" />
                                                        <Text style={styles.radioLabel}>Unqualified and Submit to Draft</Text>
                                                    </View>
                                                </RadioButton.Group>
                                            </View>

                                            <PaperTextInput
                                                mode="outlined"
                                                label="Reason for decline"
                                                value={reason}
                                                onChangeText={setReason}
                                                multiline
                                                numberOfLines={4}
                                                style={styles.reasonInput}
                                                placeholder="Enter the reason for declining this quotation..."
                                                error={isDecline && !reason.trim()}
                                                textColor="black"
                                            />
                                        </>
                                    )}

                                    <View style={styles.buttonContainer}>
                                        <Button
                                            mode="outlined"
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                handleDismiss();
                                            }}
                                            style={[styles.button, styles.cancelButton]}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            mode="contained"
                                            onPress={handleConfirm}
                                            style={[
                                                styles.button,
                                                isApprove ? styles.approveButton : styles.declineButton
                                            ]}
                                            disabled={loading || (isDecline && !reason.trim()) || (isApprove && !poNumber.trim())}
                                            loading={loading}
                                            textColor='white'
                                        >
                                            {isApprove ? 'Approve' : 'Submit'}
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Provider>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        flex: 1,
    },
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 16,
        padding: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        maxWidth: 350,
        width: '90%',
        alignSelf: 'center',
        position: 'relative',
    },
    content: {
        padding: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    message: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
    },
    reasonInput: {
        marginBottom: 28,
        backgroundColor: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 4,
    },
    cancelButton: {
        borderColor: '#ccc',
    },
    approveButton: {
        backgroundColor: Colors.light.tint,
    },
    declineButton: {
        backgroundColor: '#dc3545',
    },
    declineTypeContainer: {
        marginBottom: 20,
    },
    declineTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    radioLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
}); 