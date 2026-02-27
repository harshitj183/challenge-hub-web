"use client";
import styles from '../page.module.css';

export default function SupportPage() {
    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Support Tickets</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Handle user inquiries and support requests
                    </p>
                </div>
            </header>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Support ticketing system module is coming soon.</p>
            </div>
        </div>
    );
}
