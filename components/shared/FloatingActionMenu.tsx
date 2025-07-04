import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export interface MenuItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
}

interface FloatingActionMenuProps {
    menuItems: MenuItem[];
    buttonColor?: string;
    iconColor?: string;
    size?: number;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    menuDirection?: 'up' | 'down' | 'left' | 'right';
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
    menuItems,
    buttonColor = '#007AFF',
    iconColor = '#FFFFFF',
    size = 56,
    position = 'bottom-right',
    menuDirection = 'up',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;

        Animated.parallel([
            Animated.timing(rotateAnim, {
                toValue,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        setIsOpen(!isOpen);
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    const getPositionStyle = () => {
        const offset = 20;

        switch (position) {
            case 'bottom-right':
                return { bottom: offset, right: offset };
            case 'bottom-left':
                return { bottom: offset, left: offset };
            case 'top-right':
                return { top: offset + 50, right: offset }; // Add extra top for status bar
            case 'top-left':
                return { top: offset + 50, left: offset };
            default:
                return { bottom: offset, right: offset };
        }
    };

    const getMenuItemPosition = (index: number) => {
        const spacing = 70;
        const itemSize = 50;

        switch (menuDirection) {
            case 'up':
                return {
                    bottom: spacing * (index + 1),
                    right: (size - itemSize) / 2,
                };
            case 'down':
                return {
                    top: spacing * (index + 1),
                    right: (size - itemSize) / 2,
                };
            case 'left':
                return {
                    right: spacing * (index + 1),
                    bottom: (size - itemSize) / 2,
                };
            case 'right':
                return {
                    left: spacing * (index + 1),
                    bottom: (size - itemSize) / 2,
                };
            default:
                return {
                    bottom: spacing * (index + 1),
                    right: (size - itemSize) / 2,
                };
        }
    };

    const renderMenuItem = (item: MenuItem, index: number) => {
        const itemScale = scaleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const itemOpacity = scaleAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        });

        return (
            <Animated.View
                key={item.id}
                style={[
                    styles.menuItem,
                    getMenuItemPosition(index),
                    {
                        transform: [{ scale: itemScale }],
                        opacity: itemOpacity,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.menuButton,
                        { backgroundColor: item.color || buttonColor },
                    ]}
                    onPress={() => {
                        item.onPress();
                        toggleMenu();
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={item.icon}
                        size={24}
                        color={iconColor}
                    />
                </TouchableOpacity>
                <Text style={styles.menuLabel}>{item.title}</Text>
            </Animated.View>
        );
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={toggleMenu}
                    activeOpacity={1}
                />
            )}

            {/* Menu Container */}
            <View style={[styles.container, getPositionStyle()]}>
                {/* Menu Items */}
                {menuItems.map((item, index) => renderMenuItem(item, index))}

                {/* Main FAB */}
                <TouchableOpacity
                    style={[
                        styles.fab,
                        {
                            backgroundColor: buttonColor,
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        },
                    ]}
                    onPress={toggleMenu}
                    activeOpacity={0.8}
                >
                    <Animated.View
                        style={{
                            transform: [{ rotate: rotation }],
                        }}
                    >
                        <Ionicons
                            name="add"
                            size={size * 0.5}
                            color={iconColor}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 1000,
    },
    fab: {
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 999,
    },
    menuItem: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 1001,
    },
    menuButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    menuLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});

export default FloatingActionMenu;