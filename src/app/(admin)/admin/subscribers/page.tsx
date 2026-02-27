"use client";
import styles from '../page.module.css';

export default function SubscribersPage() {
    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Subscribers</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Manage platform subscribers and tiers
                    </p>
                </div>
            </header>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Subscriber management module is coming soon.</p>
            </div>
        </div>
    );
}
