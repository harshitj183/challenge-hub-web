"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    category: string;
    participants: number;
    status: string;
    image: string;
    badge: 'Prize' | 'Normal';
    createdAt: string;
}

const filters = ['All Challenges', 'Prize', 'Normal', 'Active', 'Upcoming', 'Ended'];

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All Challenges');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/challenges?limit=50');
            const data = await res.json();
            if (res.ok) {
                setChallenges(data.challenges);
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChallenges = challenges.filter(challenge => {
        const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFilter = true;
        if (activeFilter === 'All Challenges') matchesFilter = true;
        else if (activeFilter === 'Prize') matchesFilter = challenge.badge === 'Prize';
        else if (activeFilter === 'Normal') matchesFilter = challenge.badge === 'Normal';
        else if (activeFilter === 'Active') matchesFilter = challenge.status === 'active';
        else if (activeFilter === 'Upcoming') matchesFilter = challenge.status === 'upcoming';
        else if (activeFilter === 'Ended') matchesFilter = challenge.status === 'ended';

        return matchesSearch && matchesFilter;
    });

    return (
        <div className={styles.challengesPage}>
            <header className={styles.header}>
                <h1 className="text-gradient">Challenges</h1>
            </header>

            {/* Filter Bar */}
            <div className={styles.filterSection}>
                <div className={styles.filterTabs}>
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Challenges List */}
            <div className={styles.challengesList}>
                <h3 className={styles.sectionTitle}>{activeFilter}</h3>

                {loading ? (
                    <div className={styles.loadingState}>
                        <div className="spinner"></div>
                        <p>Loading challenges...</p>
                    </div>
                ) : (
                    <div className={styles.challengesContainer}>
                        {filteredChallenges.map(challenge => (
                            <Link href={`/challenges/${challenge._id}`} key={challenge._id} className="no-underline">
                                <div className={`glass-card ${styles.challengeCard}`}>
                                    <div className={styles.challengeImageBox}>
                                        <Image
                                            src={challenge.image.startsWith('http') ? challenge.image : '/images/placeholder.png'}
                                            alt={challenge.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                        {challenge.badge && (
                                            <span className={`${styles.badge} ${styles[challenge.badge.toLowerCase()]}`}>
                                                {challenge.badge}
                                            </span>
                                        )}
                                        {challenge.status === 'ended' && (
                                            <span className={styles.endedBadge}>Ended</span>
                                        )}
                                    </div>

                                    <div className={styles.challengeContent}>
                                        <h4>{challenge.title}</h4>
                                        <p className={styles.description}>{challenge.description}</p>

                                        <div className={styles.metaInfo}>
                                            <div className={styles.metaItem}>
                                                <span className={styles.icon}>👥</span>
                                                <span>{challenge.participants.toLocaleString()} Participants</span>
                                            </div>
                                        </div>

                                        <div className={styles.challengeFooter}>
                                            <div className={styles.participantInfo}>
                                                <span className={styles.icon}>📊</span>
                                                <span className={styles.participants}>
                                                    {challenge.status}
                                                </span>
                                            </div>
                                            <button className={styles.joinBtn}>
                                                {challenge.status === 'ended' ? 'View Results' : 'Join'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredChallenges.length === 0 && (
                    <div className={styles.emptyState}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
                        <h3>No challenges found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}

