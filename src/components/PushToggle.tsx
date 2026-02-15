
"use client";

import { usePushSubscription } from '@/hooks/usePushSubscription';

export default function PushToggle() {
    const { isSubscribed, subscribe, loading, permission, error } = usePushSubscription();

    if (isSubscribed) {
        return (
            <div style={{
                padding: '0.5rem',
                color: '#4ade80',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: 0.8
            }}>
                <span>🔔</span> Notifications Active
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div style={{ padding: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                🔕 Notifications blocked
            </div>
        );
    }

    return (
        <button
            onClick={subscribe}
            disabled={loading}
            title={error || "Enable Push Notifications"}
            style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s'
            }}
        >
            {loading ? 'Enabling...' : '🔔 Enable Notifications'}
        </button>
    );
}
