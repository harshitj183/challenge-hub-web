"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../page.module.css';

interface Winner {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    };
    challengeId: {
        _id: string;
        title: string;
        badge: string;
        prize?: { amount: number; currency: string };
    };
    mediaUrl: string;
    votes: number;
    status: string;
    isWinner: boolean;
}

export default function AdminWinnersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [winners, setWinners] = useState<Winner[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchWinners();
        }
    }, [status, session, router]);

    const fetchWinners = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/submissions?limit=50');
            const data = await res.json();

            if (res.ok) {
                const submissions = data.submissions
                    .filter((s: any) => s.status === 'approved')
                    .sort((a: any, b: any) => b.votes - a.votes);

                setWinners(submissions);
            }
        } catch (error) {
            console.error('Error fetching winners:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWinner = async (submissionId: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/submissions/winner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, isWinner: !currentStatus }),
            });

            if (res.ok) {
                setWinners(prev => prev.map(w =>
                    w._id === submissionId ? { ...w, isWinner: !currentStatus } : w
                ));
            }
        } catch (error) {
            console.error('Error toggling winner:', error);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading winners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Winners Management</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Manage challenge winners and prize distributions
                    </p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>🏆 Top Submissions & Winner Selection</h3>

                {winners.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No submissions found
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {winners.map((winner, idx) => (
                            <div key={winner._id} className="glass-card" style={{
                                padding: '1.5rem',
                                display: 'flex',
                                gap: '1.5rem',
                                alignItems: 'center',
                                background: winner.isWinner ? 'rgba(212, 175, 55, 0.08)' : undefined,
                                border: winner.isWinner ? '1px solid var(--accent-primary)' : undefined,
                            }}>
                                {/* Rank */}
                                <div style={{
                                    fontSize: '2rem',
                                    minWidth: '60px',
                                    textAlign: 'center',
                                }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </div>

                                {/* Submission Image */}
                                <div style={{
                                    position: 'relative',
                                    width: '120px',
                                    height: '140px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <Image
                                        src={winner.mediaUrl}
                                        alt="Submission"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        unoptimized
                                    />
                                    {winner.isWinner && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            padding: '4px 8px',
                                            background: 'var(--accent-primary)',
                                            color: 'black',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            borderBottomLeftRadius: '8px'
                                        }}>WINNER</div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                        }}>
                                            <Image
                                                src={winner.userId?.avatar || `https://ui-avatars.com/api/?name=${winner.userId?.name}`}
                                                alt={winner.userId?.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized
                                            />
                                        </div>
                                        <div>
                                            <h4 style={{ marginBottom: '0.1rem' }}>{winner.userId?.name}</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {winner.userId?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Challenge: <strong style={{ color: 'var(--text-primary)' }}>{winner.challengeId?.title}</strong>
                                    </p>
                                    {winner.challengeId?.prize && (
                                        <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                                            💰 Prize: {winner.challengeId.prize.currency} {winner.challengeId.prize.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Votes */}
                                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Platform Votes
                                    </p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                        🔥 {winner.votes}
                                    </h3>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => toggleWinner(winner._id, winner.isWinner)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: winner.isWinner ? 'rgba(239, 68, 68, 0.1)' : 'var(--gradient-main)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: winner.isWinner ? '#ef4444' : 'black',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            minWidth: '120px'
                                        }}
                                    >
                                        {winner.isWinner ? 'Remove Winner' : 'Make Winner 🏆'}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/challenges/${winner.challengeId?._id}`)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '6px',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
