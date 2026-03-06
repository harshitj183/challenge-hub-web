"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

interface Ticket {
    id: string;
    user: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
}

export default function AdminSupportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchTickets();
        }
    }, [status, session, router]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/support');
            const data = await res.json();
            if (res.ok) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return 'var(--text-muted)';
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Support Tickets</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Manage user inquiries and technical support
                    </p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div className={styles.cardHeader}>
                    <h3>📢 Inquiry Feed</h3>
                    <div className={styles.actionBtn}>All Categories</div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Subject</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ticket.id}</span></td>
                                    <td><span style={{ fontWeight: 500 }}>{ticket.user}</span></td>
                                    <td><span style={{ fontWeight: 500 }}>{ticket.subject}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: getPriorityColor(ticket.priority) }}></div>
                                            <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{ticket.priority}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase',
                                            background: ticket.status === 'open' ? 'rgba(239, 68, 68, 0.1)' : ticket.status === 'in-progress' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: ticket.status === 'open' ? '#ef4444' : ticket.status === 'in-progress' ? '#f59e0b' : '#10b981',
                                            border: `1px solid ${ticket.status === 'open' ? 'rgba(239, 68, 68, 0.2)' : ticket.status === 'in-progress' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn}>Reply</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
