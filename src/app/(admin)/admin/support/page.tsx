"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

interface Reply {
    message: string;
    isAdmin: boolean;
    authorName: string;
    createdAt: string;
}

interface Ticket {
    _id: string;
    ticketId: string;
    userName: string;
    userEmail: string;
    subject: string;
    message: string;
    category: string;
    priority: string;
    status: string;
    replies: Reply[];
    createdAt: string;
}

interface Stats {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
}

const PRIORITY_COLORS: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#10b981',
};

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
    open: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    'in-progress': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    resolved: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    closed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: 'rgba(107,114,128,0.3)' },
};

export default function AdminSupportPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [stats, setStats] = useState<Stats>({ open: 0, inProgress: 0, resolved: 0, closed: 0 });
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [toast, setToast] = useState('');
    const [seeding, setSeeding] = useState(false);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.set('status', filterStatus);
            if (filterCategory !== 'all') params.set('category', filterCategory);
            if (filterPriority !== 'all') params.set('priority', filterPriority);

            const res = await fetch(`/api/admin/support?${params}`);
            const data = await res.json();
            if (res.ok) {
                setTickets(data.tickets);
                setStats(data.stats || { open: 0, inProgress: 0, resolved: 0, closed: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterCategory, filterPriority]);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/login');
        else if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/');
        else if (status === 'authenticated') fetchTickets();
    }, [status, session, router, fetchTickets]);

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/support/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, status: newStatus } : t));
                if (selectedTicket?.ticketId === ticketId) {
                    setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
                }
                showToast(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            showToast('Failed to update status');
        }
    };

    const handleReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;
        setReplying(true);
        try {
            const res = await fetch(`/api/admin/support/${selectedTicket.ticketId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: replyText }),
            });
            const data = await res.json();
            if (res.ok) {
                const updatedTicket = { ...selectedTicket, replies: [...selectedTicket.replies, data.reply], status: 'in-progress' };
                setSelectedTicket(updatedTicket);
                setTickets(prev => prev.map(t => t.ticketId === selectedTicket.ticketId ? updatedTicket : t));
                setReplyText('');
                showToast('Reply sent successfully!');
            } else {
                showToast(data.error || 'Failed to send reply');
            }
        } catch {
            showToast('Error sending reply');
        } finally {
            setReplying(false);
        }
    };

    const handleDelete = async (ticketId: string) => {
        if (!confirm(`Delete ticket ${ticketId}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/support/${ticketId}`, { method: 'DELETE' });
            if (res.ok) {
                setTickets(prev => prev.filter(t => t.ticketId !== ticketId));
                if (selectedTicket?.ticketId === ticketId) setSelectedTicket(null);
                showToast('Ticket deleted');
            }
        } catch {
            showToast('Failed to delete ticket');
        }
    };

    const handleSeedData = async () => {
        setSeeding(true);
        try {
            const res = await fetch('/api/admin/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seed' }),
            });
            if (res.ok) {
                showToast('Sample tickets added!');
                fetchTickets();
            }
        } catch {
            showToast('Failed to seed data');
        } finally {
            setSeeding(false);
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
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
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                    background: 'var(--gradient-main)', color: 'black',
                    padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(212,175,55,0.4)', animation: 'none',
                }}>
                    ✓ {toast}
                </div>
            )}

            {/* Reply / Detail Modal */}
            {selectedTicket && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div className="glass-card" style={{
                        width: '100%', maxWidth: '680px', maxHeight: '85vh',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0,
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedTicket.ticketId}</span>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                                        borderRadius: '4px', textTransform: 'uppercase',
                                        background: STATUS_STYLES[selectedTicket.status]?.bg,
                                        color: STATUS_STYLES[selectedTicket.status]?.color,
                                        border: `1px solid ${STATUS_STYLES[selectedTicket.status]?.border}`,
                                    }}>{selectedTicket.status}</span>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                                        borderRadius: '4px', textTransform: 'capitalize',
                                        color: PRIORITY_COLORS[selectedTicket.priority],
                                        background: `${PRIORITY_COLORS[selectedTicket.priority]}20`,
                                    }}>⚡ {selectedTicket.priority}</span>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedTicket.subject}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {selectedTicket.userName} · {selectedTicket.userEmail} · {getRelativeTime(selectedTicket.createdAt)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} style={{
                                background: 'rgba(255,255,255,0.07)', border: 'none', color: 'var(--text-secondary)',
                                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>✕</button>
                        </div>

                        {/* Conversation Thread */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Original message */}
                            <div style={{
                                background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedTicket.userName}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getRelativeTime(selectedTicket.createdAt)}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedTicket.message}</p>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies.map((reply, idx) => (
                                <div key={idx} style={{
                                    background: reply.isAdmin ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)',
                                    borderRadius: '10px', padding: '1rem',
                                    border: reply.isAdmin ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                    marginLeft: reply.isAdmin ? '2rem' : 0,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: reply.isAdmin ? 'var(--accent-primary)' : 'inherit' }}>
                                            {reply.isAdmin ? '🛡️ Admin — ' : ''}{reply.authorName}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getRelativeTime(reply.createdAt)}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{reply.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Status Controls */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                {['open', 'in-progress', 'resolved', 'closed'].map(s => (
                                    <button key={s} onClick={() => handleStatusChange(selectedTicket.ticketId, s)} style={{
                                        padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                                        borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize',
                                        border: `1px solid ${STATUS_STYLES[s]?.border}`,
                                        background: selectedTicket.status === s ? STATUS_STYLES[s]?.bg : 'transparent',
                                        color: STATUS_STYLES[s]?.color,
                                        opacity: selectedTicket.status === s ? 1 : 0.6,
                                    }}>
                                        {selectedTicket.status === s ? '✓ ' : ''}{s}
                                    </button>
                                ))}
                            </div>
                            {/* Reply Input */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Type your reply to the user..."
                                    rows={2}
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                        padding: '0.6rem 0.8rem', color: 'white', resize: 'none',
                                        fontSize: '0.9rem', outline: 'none',
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={replying || !replyText.trim()}
                                    style={{
                                        padding: '0 1rem', background: 'var(--gradient-main)',
                                        border: 'none', borderRadius: '8px', color: 'black',
                                        fontWeight: 700, cursor: replying || !replyText.trim() ? 'not-allowed' : 'pointer',
                                        opacity: replying || !replyText.trim() ? 0.6 : 1, fontSize: '0.85rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {replying ? 'Sending...' : 'Send ↩'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Ctrl+Enter to send</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Support Tickets</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Manage user inquiries and technical support
                    </p>
                </div>
                {tickets.length === 0 && (
                    <button
                        className="btn-primary"
                        onClick={handleSeedData}
                        disabled={seeding}
                        style={{ opacity: seeding ? 0.7 : 1 }}
                    >
                        {seeding ? 'Adding...' : '+ Add Sample Tickets'}
                    </button>
                )}
            </header>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Open', count: stats.open, color: '#ef4444' },
                    { label: 'In Progress', count: stats.inProgress, color: '#f59e0b' },
                    { label: 'Resolved', count: stats.resolved, color: '#10b981' },
                    { label: 'Closed', count: stats.closed, color: '#6b7280' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => setFilterStatus(s.label.toLowerCase().replace(' ', '-'))}>
                        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.count}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Filter:</span>
                {/* Status filter */}
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                {/* Category filter */}
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <option value="all">All Categories</option>
                    <option value="payment">Payment</option>
                    <option value="technical">Technical</option>
                    <option value="account">Account</option>
                    <option value="badge">Badge</option>
                    <option value="challenge">Challenge</option>
                    <option value="other">Other</option>
                </select>
                {/* Priority filter */}
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                {(filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all') && (
                    <button onClick={() => { setFilterStatus('all'); setFilterCategory('all'); setFilterPriority('all'); }}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-secondary)', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                        ✕ Clear Filters
                    </button>
                )}
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tickets.length} tickets</span>
            </div>

            {/* Tickets Table */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {tickets.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>No support tickets found</p>
                        <button className="btn-primary" onClick={handleSeedData} disabled={seeding}>
                            {seeding ? 'Adding...' : 'Load Sample Tickets'}
                        </button>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Subject</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Replies</th>
                                    <th>Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTicket(ticket)}>
                                        <td><span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>{ticket.ticketId}</span></td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ticket.userName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.userEmail}</div>
                                            </div>
                                        </td>
                                        <td><span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ticket.subject}</span></td>
                                        <td>
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textTransform: 'capitalize' }}>
                                                {ticket.category}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[ticket.priority], flexShrink: 0 }} />
                                                <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{ticket.priority}</span>
                                            </div>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <select
                                                value={ticket.status}
                                                onChange={e => handleStatusChange(ticket.ticketId, e.target.value)}
                                                style={{
                                                    background: STATUS_STYLES[ticket.status]?.bg,
                                                    border: `1px solid ${STATUS_STYLES[ticket.status]?.border}`,
                                                    color: STATUS_STYLES[ticket.status]?.color,
                                                    borderRadius: '5px', padding: '0.2rem 0.5rem',
                                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                <option value="open">OPEN</option>
                                                <option value="in-progress">IN-PROGRESS</option>
                                                <option value="resolved">RESOLVED</option>
                                                <option value="closed">CLOSED</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem', color: ticket.replies?.length > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                                💬 {ticket.replies?.length || 0}
                                            </span>
                                        </td>
                                        <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getRelativeTime(ticket.createdAt)}</span></td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    style={{ background: 'var(--gradient-main)', color: 'black', fontWeight: 700, border: 'none' }}
                                                >Reply</button>
                                                <button
                                                    onClick={() => handleDelete(ticket.ticketId)}
                                                    style={{
                                                        padding: '0.35rem 0.6rem', background: 'rgba(239,68,68,0.1)',
                                                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
                                                        color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem',
                                                    }}
                                                >✕</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
