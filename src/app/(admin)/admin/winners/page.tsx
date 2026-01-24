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
            // Fetch top submissions from ended challenges
            const res = await fetch('/api/submissions?limit=50');
            const data = await res.json();

            if (res.ok) {
                // Filter for approved submissions and sort by votes
                const topSubmissions = data.submissions
                    .filter((s: any) => s.status === 'approved')
                    .sort((a: any, b: any) => b.votes - a.votes);

                setWinners(topSubmissions);
            }
        } catch (error) {
            console.error('Error fetching winners:', error);
        } finally {
            setLoading(false);
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
                        Manage challenge winners and prizes
                    </p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>🏆 Top Submissions & Winners</h3>

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
                                background: idx < 3 ? 'rgba(255, 215, 0, 0.05)' : undefined,
                                border: idx < 3 ? '1px solid rgba(255, 215, 0, 0.2)' : undefined,
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
                                    height: '120px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                }}>
                                    <Image
                                        src={winner.mediaUrl}
                                        alt="Submission"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
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
                                            />
                                        </div>
                                        <div>
                                            <h4 style={{ marginBottom: '0.25rem' }}>{winner.userId?.name}</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {winner.userId?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Challenge: <strong>{winner.challengeId?.title}</strong>
                                    </p>
                                    {winner.challengeId?.prize && (
                                        <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.25rem' }}>
                                            💰 Prize: {winner.challengeId.prize.currency} {winner.challengeId.prize.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Votes */}
                                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        Votes
                                    </p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        ❤️ {winner.votes}
                                    </h3>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => router.push(`/challenges/${winner.challengeId._id}`)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            border: '1px solid rgba(99, 102, 241, 0.3)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        View Challenge
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
