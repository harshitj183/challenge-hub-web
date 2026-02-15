
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushSubscription() {
    const { data: session } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsSubscribed(true);
                    }
                });
            }).catch(e => console.log('SW not ready or supported'));
        }
    }, []);

    const subscribe = async () => {
        if (!session) {
            setError('Please login first');
            return;
        }
        if (!VAPID_PUBLIC_KEY) {
            console.error('No VAPID key');
            setError('System configuration error: No VAPID key');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                throw new Error('Permission denied');
            }

            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready; // Wait for active

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send to server
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: sub.endpoint,
                    keys: sub.toJSON().keys,
                    userAgent: navigator.userAgent
                })
            });

            if (!res.ok) throw new Error('Failed to save subscription');

            setIsSubscribed(true);
            alert('Notifications enabled!');
        } catch (err: any) {
            console.error('Failed to subscribe', err);
            setError(err.message || 'Failed to subscribe');
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, subscribe, loading, permission, error };
}
