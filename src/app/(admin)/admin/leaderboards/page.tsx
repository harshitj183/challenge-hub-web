"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../page.module.css';

interface LeaderboardEntry {
    rank: number;
    userId: { _id: string; name: string; username?: string; avatar: string };
    challengeId: { title: string; badge: string };
    points: number;
    wins: number;
}

export default function AdminLeaderboardsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchLeaderboard();
        }
    }, [status, session, router, currentPage]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/leaderboards?page=${currentPage}&limit=10`);
            const data = await res.json();
            if (res.ok) {
                setLeaderboard(data.leaderboard);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading leaderboards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Leaderboards Management</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        View top participants across all challenges
                    </p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div className={styles.cardHeader}>
                    <h3>🏆 Global Leaderboard</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {totalItems === 0 ? '0-0' : `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, totalItems)}`} of {totalItems}
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Challenge (Global/Specific)</th>
                                <th>User</th>
                                <th>Points</th>
                                <th>Wins</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((item, idx) => (
                                <tr key={idx} style={item.rank <= 3 ? { background: 'rgba(99, 102, 241, 0.05)' } : {}}>
                                    <td>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            {item.challengeId?.badge === 'Prize' && <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>🏆 Prize</span>}
                                            <span style={{ fontWeight: 500 }}>{item.challengeId?.title || 'Global'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 32, height: 32, position: 'relative', borderRadius: '50%', overflow: 'hidden' }}>
                                                <Image
                                                    src={item.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userId?.name || 'User')}`}
                                                    alt={item.userId?.name || 'User'}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    unoptimized
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 500 }}>
                                                    {item.userId?.username ? `@${item.userId.username}` : (item.userId?.name || 'User')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.points.toLocaleString()} pts</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{item.wins}</span>
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn}>View Profile</button>
                                    </td>
                                </tr>
                            ))}
                            {leaderboard.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <button
                        className={styles.actionBtn}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >← Prev</button>
                    <button
                        className={styles.actionBtn}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={(currentPage * 10) >= totalItems}
                        style={{ opacity: (currentPage * 10) >= totalItems ? 0.5 : 1, cursor: (currentPage * 10) >= totalItems ? 'not-allowed' : 'pointer', background: '#4f46e5', color: 'white' }}
                    >Next →</button>
                </div>
            </div>
        </div>
    );
}
