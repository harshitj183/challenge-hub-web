"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    badge: string;
    participants: number;
    status: string;
    startDate: string;
    endDate: string;
}

interface Submission {
    _id: string;
    challengeId: Challenge;
    status: string;
    createdAt: string;
}

export default function MyChallengesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [myChallenges, setMyChallenges] = useState<any[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchMyChallenges();
        }
    }, [status, router]);

    const fetchMyChallenges = async () => {
        try {
            setLoading(true);

            // Fetch user's submissions to find participated challenges
            const res = await fetch(`/api/submissions?userId=${session?.user?.id}`);
            const data = await res.json();

            if (res.ok && data.submissions) {
                // Map submissions to challenges with progress
                const challengesMap = new Map();

                data.submissions.forEach((sub: Submission) => {
                    if (sub.challengeId && !challengesMap.has(sub.challengeId._id)) {
                        const challenge = sub.challengeId;
                        const daysLeft = calculateDaysLeft(challenge.endDate);
                        const progress = sub.status === 'approved' ? 100 : 50;

                        challengesMap.set(challenge._id, {
                            ...challenge,
                            progress,
                            deadline: daysLeft > 0 ? `${daysLeft} Days Left` : challenge.status === 'ended' ? 'Ended' : 'Active',
                            userStatus: challenge.status === 'ended' ? 'completed' : 'active',
                        });
                    }
                });

                setMyChallenges(Array.from(challengesMap.values()));
            }
        } catch (error) {
            console.error('Error fetching my challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysLeft = (endDate: string): number => {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredChallenges = myChallenges.filter(challenge => {
        if (filter === 'all') return true;
        if (filter === 'active') return challenge.userStatus === 'active';
        if (filter === 'completed') return challenge.userStatus === 'completed';
        return true;
    });

    if (loading || status === 'loading') {
        return (
            <div className={styles.myChallengesPage}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Loading your challenges...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.myChallengesPage}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">My Challenges</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Track your active and completed challenges
                    </p>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Challenges
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'completed' ? styles.active : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>

            {/* Challenges Grid */}
            {filteredChallenges.length === 0 ? (
                <div className={styles.emptyState}>
                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</p>
                    <h3>No challenges found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {filter === 'all'
                            ? 'Start participating in challenges to see them here'
                            : `No ${filter} challenges yet`
                        }
                    </p>
                    <Link href="/challenges">
                        <button className="btn-primary">Browse Challenges</button>
                    </Link>
                </div>
            ) : (
                <div className={styles.challengesGrid}>
                    {filteredChallenges.map(challenge => (
                        <div key={challenge._id} className={`glass-card ${styles.challengeCard}`}>
                            <div className={styles.challengeImage}>
                                <Image
                                    src={challenge.image || '/images/placeholder.png'}
                                    alt={challenge.title}
                                    fill
                                    unoptimized
                                    style={{ objectFit: 'cover' }}
                                />
                                {challenge.badge && (
                                    <span className={`${styles.badge} ${styles[challenge.badge.toLowerCase()]}`}>
                                        {challenge.badge}
                                    </span>
                                )}
                                {challenge.userStatus === 'completed' && (
                                    <span className={styles.completedBadge}>✓ Completed</span>
                                )}
                            </div>

                            <div className={styles.challengeContent}>
                                <h4>{challenge.title}</h4>
                                <p className={styles.description}>{challenge.description}</p>

                                <div className={styles.metaInfo}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.icon}>👥</span>
                                        <span>{challenge.participants?.toLocaleString() || 0} Participants</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.icon}>⏱️</span>
                                        <span>{challenge.deadline}</span>
                                    </div>
                                </div>

                                {challenge.userStatus === 'active' && (
                                    <div className={styles.progressSection}>
                                        <div className={styles.progressHeader}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Progress</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{challenge.progress}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: `${challenge.progress}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                <Link href={`/challenges/${challenge._id}`}>
                                    <button className={styles.actionBtn}>
                                        {challenge.userStatus === 'completed' ? 'View Results' : 'Continue'}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
