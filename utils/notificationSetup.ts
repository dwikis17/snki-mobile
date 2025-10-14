import * as Notifications from 'expo-notifications';
import { RelativePathString, router } from 'expo-router';
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

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {

        const data = response.notification.request.content.data;

        // Handle URL-based deep linking
        if (data.link) {
            console.log('Opening URL:', data.link);
            // Navigate to the stack first, then to the specific screen
            const url = data.link as string;
            if (url.includes('view-pr')) {
                router.push(`/(pr-stack)`);
                setTimeout(() => {
                    router.push(`/(pr-stack)/view-pr?code=${data.code}`);
                }, 100);
            } else if (url.includes('view-invoice')) {
                router.push(`/(invoice-stack)`);
                setTimeout(() => {
                    router.push(`/(invoice-stack)/view-invoice?code=${data.code}`);
                }, 100);
            } else if (url.includes('view-quotation')) {
                router.push(`/(quotation-stack)`);
                setTimeout(() => {
                    router.push(`/(quotation-stack)/view-quotation?code=${data.code}`);
                }, 100);
            } else if (url.includes('view-purchase-order')) {
                router.push(`/(purchase-order)`);
                setTimeout(() => {
                    router.push(`/(purchase-order)/view-purchase-order?code=${data.code}`);
                }, 100);
            } else if (url.includes('view-tracking')) {
                router.push(`/(tracking-stack)`);
                setTimeout(() => {
                    router.push(`/(tracking-stack)/view-tracking?code=${data.code}`);
                }, 100);
            } else {
                router.push(url as RelativePathString);
            }
        }
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
};


