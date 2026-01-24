"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

interface Challenge {
    _id: string;
    title: string;
    image: string;
    status: string;
    badge: string;
}

interface Winner {
    _id: string;
    userId: {
        _id: string;
        name: string;
        avatar: string;
    };
    challengeId: Challenge;
    mediaUrl: string;
    votes: number;
    status: string;
}

export default function WinnersPage() {
    const router = useRouter();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchWinners();
    }, []);

    const fetchWinners = async () => {
        try {
            setLoading(true);
            // Fetch ended challenges and their top submissions
            const [challengesRes, submissionsRes] = await Promise.all([
                fetch('/api/challenges?limit=100'),
                fetch('/api/submissions?limit=100'),
            ]);

            const challengesData = await challengesRes.json();
            const submissionsData = await submissionsRes.json();

            if (challengesRes.ok && submissionsRes.ok) {
                // Get ended challenges
                const endedChallenges = challengesData.challenges.filter(
                    (c: any) => c.status === 'ended'
                );

                // For each ended challenge, find the top submission
                const winnersData: Winner[] = [];

                for (const challenge of endedChallenges) {
                    const challengeSubmissions = submissionsData.submissions
                        .filter((s: any) => s.challengeId?._id === challenge._id)
                        .sort((a: any, b: any) => b.votes - a.votes);

                    if (challengeSubmissions.length > 0) {
                        winnersData.push(challengeSubmissions[0]);
                    }
                }

                setWinners(winnersData);
            }
        } catch (error) {
            console.error('Error fetching winners:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWinners = winners.filter(winner => {
        const matchesSearch = winner.challengeId?.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleViewChallenge = (challengeId: string) => {
        router.push(`/challenges/${challengeId}`);
    };

    if (loading) {
        return (
            <div className={styles.winnersPage}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Loading winners...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.winnersPage}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Winners</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Winners of recently completed challenges
                    </p>
                </div>
            </header>

            {/* Filter */}
            <div className={styles.filterSection}>
                <button className={`${styles.filterBtn} ${styles.active}`}>
                    📋 All Challenges ▼
                </button>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className={styles.searchBtn}>Search</button>
                </div>
            </div>

            {/* Winners Grid */}
            <div className={styles.winnersSection}>
                <h3 className={styles.sectionTitle}>
                    Completed Challenges ({filteredWinners.length})
                </h3>

                {filteredWinners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <p>No completed challenges with winners yet.</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                            Winners will appear here once challenges end and submissions are voted on.
                        </p>
                    </div>
                ) : (
                    <div className={styles.winnersGrid}>
                        {filteredWinners.map((winner) => (
                            <div key={winner._id} className={`glass-card ${styles.winnerCard}`}>
                                <div className={styles.winnerImage}>
                                    <Image
                                        src={winner.mediaUrl || winner.challengeId?.image || '/images/placeholder.png'}
                                        alt={winner.challengeId?.title || 'Challenge'}
                                        fill
                                        unoptimized
                                        style={{ objectFit: 'cover' }}
                                    />
                                    {winner.challengeId?.badge === 'Prize' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}>
                                            🏆 PRIZE
                                        </div>
                                    )}
                                </div>

                                <div className={styles.winnerContent}>
                                    <h4>{winner.challengeId?.title || 'Challenge'}</h4>

                                    <div className={styles.winnerInfo}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}>
                                            <Image
                                                src={winner.userId?.avatar || `https://ui-avatars.com/api/?name=${winner.userId?.name || 'User'}`}
                                                alt={winner.userId?.name || 'User'}
                                                fill
                                                unoptimized
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span className={styles.winnerName}>
                                            {winner.userId?.name || 'Unknown User'}
                                        </span>
                                    </div>

                                    <div className={styles.metricInfo}>
                                        <span className={styles.metricIcon}>❤️</span>
                                        <span className={styles.metric}>
                                            {winner.votes.toLocaleString()} Votes
                                        </span>
                                    </div>

                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => handleViewChallenge(winner.challengeId._id)}
                                    >
                                        View
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
