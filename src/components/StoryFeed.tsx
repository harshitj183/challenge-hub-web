"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './StoryFeed.module.css';

interface Challenge {
    _id: string;
    title: string;
    image: string;
    category: string;
    participants: number;
}

export default function StoryFeed() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const res = await fetch('/api/challenges?sort=popular&limit=10');
            const data = await res.json();
            if (res.ok) {
                setChallenges(data.challenges);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.storyFeedContainer}>
            <div className={styles.header}>
                <h3>🔥 Trending Challenges</h3>
                <p>Join the most popular challenges happening right now</p>
            </div>

            <div className={styles.scrollWrapper}>
                <button
                    className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                >
                    ‹
                </button>

                <div className={styles.storiesContainer} ref={scrollContainerRef}>
                    {loading ? (
                        // Skeleton Loaders
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={styles.storyItem} style={{ pointerEvents: 'none' }}>
                                <div className={styles.storyRing} style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div className={`${styles.storyImageWrapper} skeleton`} style={{ border: 'none' }} />
                                </div>
                                <div className={styles.storyInfo} style={{ width: '100%', alignItems: 'center' }}>
                                    <div className="skeleton" style={{ width: '60px', height: '10px', marginBottom: '4px' }} />
                                    <div className="skeleton" style={{ width: '40px', height: '8px' }} />
                                </div>
                            </div>
                        ))
                    ) : (
                        challenges.map((challenge) => (
                            <Link href={`/challenges/${challenge._id}`} key={challenge._id} style={{ textDecoration: 'none' }}>
                                <div className={styles.storyItem}>
                                    <div className={styles.storyRing}>
                                        <div className={styles.storyImageWrapper}>
                                            <Image
                                                src={challenge.image}
                                                alt={challenge.title}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.storyInfo}>
                                        <span className={styles.storyUsername}>
                                            {challenge.title}
                                        </span>
                                        <span className={styles.storyVotes}>
                                            👥 {challenge.participants}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                    {!loading && challenges.length === 0 && (
                        <div style={{ padding: '1rem', color: '#888' }}>No active challenges found.</div>
                    )}
                </div>

                <button
                    className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                    onClick={scrollRight}
                    aria-label="Scroll right"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
