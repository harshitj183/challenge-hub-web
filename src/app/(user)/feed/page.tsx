"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface Submission {
    _id: string;
    title: string;
    description?: string;
    mediaUrl: string;
    votes: number;
    userId: { _id: string; name: string; username?: string; avatar: string };
    challengeId: { _id: string; title: string; category: string };
    createdAt: string;
}

export default function FeedPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'recent' | 'trending' | 'all'>('trending');
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [votingInProgress, setVotingInProgress] = useState<Set<string>>(new Set());
    const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubmissions();
        if (session) {
            fetchUserVotes();
            fetchUserFavorites();
        }
    }, [filter, session]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/submissions?limit=50`);
            const data = await res.json();
            if (res.ok) {
                let sorted = [...data.submissions];

                // Debug: Check first submission
                if (sorted.length > 0) {
                    console.log('First submission:', sorted[0]);
                    console.log('First submission userId:', sorted[0].userId);
                }

                if (filter === 'trending') {
                    sorted.sort((a, b) => b.votes - a.votes);
                } else if (filter === 'recent') {
                    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }

                setSubmissions(sorted);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserVotes = async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/votes');
            const data = await res.json();
            if (res.ok) {
                const votedSubmissionIds = new Set<string>(
                    data.votes.map((vote: any) => (vote.submissionId?._id || vote.submissionId) as string)
                );
                setUserVotes(votedSubmissionIds);
            }
        } catch (error) {
            console.error('Error fetching user votes:', error);
        }
    };

    const handleVote = async (submissionId: string) => {
        if (!session) {
            alert('Please login to vote');
            return;
        }

        if (votingInProgress.has(submissionId)) return;

        setVotingInProgress(prev => new Set(prev).add(submissionId));

        try {
            const res = await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId })
            });

            const data = await res.json();

            if (res.ok) {
                setSubmissions(prev => prev.map(sub =>
                    sub._id === submissionId
                        ? { ...sub, votes: sub.votes + (data.action === 'added' ? 1 : -1) }
                        : sub
                ));

                setUserVotes(prev => {
                    const newSet = new Set(prev);
                    if (data.action === 'added') {
                        newSet.add(submissionId);
                    } else {
                        newSet.delete(submissionId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setVotingInProgress(prev => {
                const newSet = new Set(prev);
                newSet.delete(submissionId);
                return newSet;
            });
        }
    };

    const fetchUserFavorites = async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/favorites');
            const data = await res.json();
            if (res.ok) {
                const favoriteIds = new Set<string>(
                    data.favorites.map((fav: any) => fav.submissionId?._id || fav.submissionId)
                );
                setUserFavorites(favoriteIds);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const handleFavorite = async (submissionId: string) => {
        if (!session) {
            alert('Please login to save favorites');
            return;
        }

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId })
            });

            const data = await res.json();

            if (res.ok) {
                setUserFavorites(prev => {
                    const newSet = new Set(prev);
                    if (data.action === 'added') {
                        newSet.add(submissionId);
                    } else {
                        newSet.delete(submissionId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <div className={styles.feedPage}>
            <div className={styles.header}>
                <h1>🌟 Explore Feed</h1>
                <p>Discover amazing submissions from the community</p>

                {/* Search Bar */}
                <div style={{ maxWidth: '600px', width: '100%', marginTop: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search submissions, challenges, users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1.25rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                <button
                    className={filter === 'trending' ? styles.active : ''}
                    onClick={() => setFilter('trending')}
                >
                    🔥 Trending
                </button>
                <button
                    className={filter === 'recent' ? styles.active : ''}
                    onClick={() => setFilter('recent')}
                >
                    ⚡ Recent
                </button>
                <button
                    className={filter === 'all' ? styles.active : ''}
                    onClick={() => setFilter('all')}
                >
                    📋 All
                </button>
            </div>

            {/* Submissions Grid */}
            {loading ? (
                <div className={styles.loading}>
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className={styles.submissionsGrid}>
                    {submissions.map((sub) => (
                        <div
                            key={sub._id}
                            className={`glass-card ${styles.submissionCard}`}
                            onClick={() => router.push(`/submissions/${sub._id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Image */}
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={sub.mediaUrl}
                                    alt={sub.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                {/* Challenge Tag */}
                                <Link
                                    href={`/challenges/${sub.challengeId._id}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className={styles.challengeTag}>
                                        {sub.challengeId.title}
                                    </div>
                                </Link>
                            </div>

                            {/* Content */}
                            <div className={styles.cardContent}>
                                <h3>{sub.title}</h3>
                                {sub.description && (
                                    <p className={styles.description}>{sub.description}</p>
                                )}

                                {/* Footer */}
                                <div className={styles.cardFooter}>
                                    {/* User Info */}
                                    {sub.userId?.username ? (
                                        <Link
                                            href={`/users/${sub.userId.username}`}
                                            className={styles.userInfo}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className={styles.avatar}>
                                                <Image
                                                    src={sub.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}&background=6366f1&color=fff`}
                                                    alt={sub.userId?.name || 'User'}
                                                    fill
                                                    unoptimized
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <span>@{sub.userId.username}</span>
                                        </Link>
                                    ) : (
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                <Image
                                                    src={sub.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}&background=6366f1&color=fff`}
                                                    alt={sub.userId?.name || 'User'}
                                                    fill
                                                    unoptimized
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <span>{sub.userId?.name || 'Anonymous'}</span>
                                        </div>
                                    )}

                                    {/* Vote Button */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(sub._id);
                                            }}
                                            disabled={votingInProgress.has(sub._id)}
                                            className={`${styles.voteButton} ${userVotes.has(sub._id) ? styles.voted : ''}`}
                                        >
                                            <span className={styles.heart}>
                                                {userVotes.has(sub._id) ? '❤️' : '🤍'}
                                            </span>
                                            <span className={styles.voteCount}>{sub.votes}</span>
                                        </button>

                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFavorite(sub._id);
                                            }}
                                            className={`${styles.voteButton} ${userFavorites.has(sub._id) ? styles.voted : ''}`}
                                            title={userFavorites.has(sub._id) ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <span className={styles.heart}>
                                                {userFavorites.has(sub._id) ? '⭐' : '☆'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {submissions.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>No submissions yet. Be the first to submit!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
