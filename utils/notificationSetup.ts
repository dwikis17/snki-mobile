import * as Notifications from 'expo-notifications';

// Set up notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Function to set up notification listeners
export const setupNotificationListeners = () => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
};


