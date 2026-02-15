import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:admin@photobox.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } catch (err) {
        console.error('Failed to set VAPID details:', err);
    }
} else {
    console.warn('VAPID keys are not set. Push notifications will not work.');
}

export const sendPushNotification = async (subscription: any, payload: string) => {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn('Skipping push notification: VAPID keys not configured');
        return null;
    }
    try {
        return await webpush.sendNotification(subscription, payload);
    } catch (error) {
        if ((error as any).statusCode === 410 || (error as any).statusCode === 404) {
            // Subscription expired or invalid
            console.log('Subscription expired/invalid:', subscription.endpoint);
            return { expired: true };
        }
        console.error('Error sending push notification:', error);
        throw error;
    }
};

export default webpush;
