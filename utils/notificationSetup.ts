import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

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
    console.log('Setting up notification listeners');

    Notifications.addNotificationResponseReceivedListener(response => {
        const url = response.notification.request.content.data.url;
        if (url) {
            console.log('Opening URL:', url);
            Linking.openURL(url as string);
        }
    });
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);

        // Handle deep linking navigation
        const { screen, params } = response.notification.request.content.data as {
            screen?: string;
            params?: { code?: string }
        };

        if (screen) {
            // Map screen names to actual routes
            switch (screen) {
                case 'ViewPR':
                    if (params?.code) {
                        router.push(`/(pr-stack)/view-pr?code=${params.code}`);
                    }
                    break;
                case 'ViewInvoice':
                    if (params?.code) {
                        router.push(`/(invoice-stack)/view-invoice?code=${params.code}`);
                    }
                    break;
                case 'ViewQuotation':
                    if (params?.code) {
                        router.push(`/(quotation-stack)/view-quotation?code=${params.code}`);
                    }
                    break;
                case 'ViewPurchaseOrder':
                    if (params?.code) {
                        router.push(`/(purchase-order)/view-purchase-order?code=${params.code}`);
                    }
                    break;
                case 'ViewTracking':
                    if (params?.code) {
                        router.push(`/(tracking-stack)/view-tracking?code=${params.code}`);
                    }
                    break;
                default:
                    console.log('Unknown screen:', screen);
                    break;
            }
        }
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
};


