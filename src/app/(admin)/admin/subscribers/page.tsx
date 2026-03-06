"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../page.module.css';

interface Subscriber {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
        username?: string;
    };
    plan: string;
    price: number;
    status: string;
    currentPeriodEnd: string;
}

export default function AdminSubscribersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchSubscribers();
        }
    }, [status, session, router, currentPage]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/subscribers?page=${currentPage}&limit=10`);
            const data = await res.json();
            if (res.ok) {
                setSubscribers(data.subscriptions);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading subscribers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Subscribers Management</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Manage platform subscribers and recurring revenue
                    </p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div className={styles.cardHeader}>
                    <h3>👥 Active Subscribers</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {totalItems === 0 ? '0-0' : `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, totalItems)}`} of {totalItems}
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Plan</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Expiry</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 32, height: 32, position: 'relative', borderRadius: '50%', overflow: 'hidden' }}>
                                                <Image
                                                    src={sub.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}`}
                                                    alt={sub.userId?.name || 'User'}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    unoptimized
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 500 }}>{sub.userId?.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.userId?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            textTransform: 'capitalize',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: 'rgba(212, 175, 55, 0.1)',
                                            color: 'var(--accent-primary)',
                                            fontWeight: 600
                                        }}>
                                            {sub.plan.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>${(sub.price / 100).toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[sub.status] || ''}`} style={{
                                            background: sub.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: sub.status === 'active' ? '#10b981' : '#ef4444',
                                            border: `1px solid ${sub.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '100px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem' }}>
                                            {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => {
                                                const action = confirm(`Manage subscription for ${sub.userId?.name}?\n\nPlan: ${sub.plan}\nStatus: ${sub.status}\n\nClick OK to cancel their subscription, or Cancel to go back.`);
                                                if (action) alert('Subscription cancellation initiated. (Connect Stripe webhook to fully implement.)');
                                            }}
                                        >Manage</button>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No subscribers found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <button
                        className={styles.actionBtn}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >← Prev</button>
                    <button
                        className={styles.actionBtn}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={(currentPage * 10) >= totalItems}
                        style={{ opacity: (currentPage * 10) >= totalItems ? 0.5 : 1, background: 'var(--gradient-main)', color: 'black' }}
                    >Next →</button>
                </div>
            </div>
        </div>
    );
}
