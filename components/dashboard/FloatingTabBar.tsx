import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface FloatingTabBarProps {
    sections: string[];
    onPress: (section: string) => void;
    activeSection?: string;
}

const FloatingTabBar: React.FC<FloatingTabBarProps> = ({ sections, onPress, activeSection }) => {
    const renderContent = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {sections.map((section) => (
                <TouchableOpacity
                    key={section}
                    style={[
                        styles.tab,
                        activeSection === section && styles.activeTab
                    ]}
                    onPress={() => onPress(section)}
                >
                    <Text style={[
                        styles.tabText,
                        activeSection === section && styles.activeTabText
                    ]}>
                        {section.replace(/_/g, ' ')}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    if (Platform.OS === 'ios') {
        return (
            <View style={styles.container}>
                <BlurView intensity={80} tint="light" style={styles.blurContainer}>
                    {renderContent()}
                </BlurView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.androidContainer}>
                {renderContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    blurContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    androidContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 30,
    },
    scrollContent: {
        paddingHorizontal: 8,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#1f2937',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4b5563',
        textTransform: 'capitalize',
    },
    activeTabText: {
        color: 'white',
    },
});

export default FloatingTabBar;
