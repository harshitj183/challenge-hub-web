"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import CreateChallengeModal from '@/components/challenges/CreateChallengeModal';
import Countdown from '@/components/challenges/Countdown';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    image: string;
    videoUrl?: string; // Optional since it has default ''
    category: string;
    status: 'active' | 'upcoming' | 'ended';
    createdBy: { _id: string; name: string; avatar: string };
    participants: number;
    isFree: boolean;
    entryFee: number;
    prizeType: 'MONEY' | 'COINS' | 'NONE';
    prizePool: number;
    organizerCommission: number;
    isPromoted: boolean; // Added
    ageRestriction: number; // Added
    type: 'VIRTUAL' | 'IN_PERSON'; // Added
    location?: { address: string; mapUrl?: string }; // Added
    startDate: string; // Added date string from JSON
    endDate: string;
    badge: string;
    interestedUsers: string[];
}

interface Submission {
    _id: string;
    votes: number;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    userId: { _id: string; name: string; username?: string; avatar: string };
    challengeId: { _id: string; title: string; category: string };
    createdAt: string;
}

export default function FeedPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'recent' | 'trending' | 'all' | 'challenges'>('trending');
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [votingInProgress, setVotingInProgress] = useState<Set<string>>(new Set());
    const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
    const [userChallengeFavorites, setUserChallengeFavorites] = useState<Set<string>>(new Set());
    const [interestedChallenges, setInterestedChallenges] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (filter === 'challenges') {
            fetchChallenges();
        } else {
            fetchSubmissions();
        }
        if (session) {
            fetchUserVotes();
            fetchUserFavorites();
            // Fetch interested challenges would go here if we had an endpoint for user-specific interests
        }
    }, [filter, session]);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/challenges?limit=50&sort=newest`);
            const data = await res.json();
            if (res.ok) {
                setChallenges(data.challenges);
                // Assume interestedUsers is populated relative to current user or we check it manually
                if (session?.user?.id) {
                    const interested = new Set<string>();
                    data.challenges.forEach((c: Challenge) => {
                        if (c.interestedUsers.includes(session.user.id)) {
                            interested.add(c._id);
                        }
                    });
                    setInterestedChallenges(interested);
                }
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setLoading(false);
        }
    };

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
                const favoriteIds = new Set<string>();
                const challengeFavIds = new Set<string>();

                data.favorites.forEach((fav: any) => {
                    if (fav.submissionId) favoriteIds.add(fav.submissionId._id || fav.submissionId);
                    if (fav.challengeId) challengeFavIds.add(fav.challengeId._id || fav.challengeId);
                });

                setUserFavorites(favoriteIds);
                setUserChallengeFavorites(challengeFavIds);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const handleFavorite = async (id: string, type: 'submission' | 'challenge' = 'submission') => {
        if (!session) {
            alert('Please login to save favorites');
            return;
        }

        try {
            const body = type === 'submission' ? { submissionId: id } : { challengeId: id };

            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                if (type === 'submission') {
                    setUserFavorites(prev => {
                        const newSet = new Set(prev);
                        if (data.action === 'added') newSet.add(id);
                        else newSet.delete(id);
                        return newSet;
                    });
                } else {
                    setUserChallengeFavorites(prev => {
                        const newSet = new Set(prev);
                        if (data.action === 'added') newSet.add(id);
                        else newSet.delete(id);
                        return newSet;
                    });
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleInterested = async (challengeId: string) => {
        if (!session) {
            alert('Please login to show interest');
            return;
        }
        // Optimistic update
        const isInterested = interestedChallenges.has(challengeId);
        setInterestedChallenges(prev => {
            const newSet = new Set(prev);
            if (isInterested) {
                newSet.delete(challengeId);
            } else {
                newSet.add(challengeId);

                // Mock notification scheduling
                // In a real app, this would call an API to schedule push notifications/emails
                console.log(`[Notification Leader] Scheduling notifications for Challenge ${challengeId}:`);
                console.log(`- 1 hour before start`);
                console.log(`- 30 minutes before start`);
                console.log(`- 5 minutes before start`);
                console.log(`- On Start`);

                alert("Reminder set! We'll notify you 1h, 30m, and 5m before the challenge starts.");
            }
            return newSet;
        });

        // Optimistic update - in real app, call API
        // console.log('Toggled interest for', challengeId);
    };

    // Separate promoted challenges
    const promotedChallenges = challenges.filter(c => c.isPromoted && c.status === 'upcoming');
    const regularChallenges = challenges.filter(c => !c.isPromoted || c.status !== 'upcoming');

    return (
        <div className={styles.feedContainer}>
            <div className={styles.header}>
                <h1>🌟 Explore Feed</h1>
                <p>Discover amazing submissions from the community</p>
            </div>

            {/* Create Challenge Modal */}
            {showCreateModal && (
                <CreateChallengeModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchChallenges();
                        setShowCreateModal(false);
                    }}
                />
            )}

            <div className={styles.feedHeader}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${filter === 'trending' ? styles.active : ''}`}
                        onClick={() => setFilter('trending')}
                    >
                        Trending
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'recent' ? styles.active : ''}`}
                        onClick={() => setFilter('recent')}
                    >
                        Recent
                    </button>
                    <button
                        className={`${styles.tab} ${filter === 'challenges' ? styles.active : ''}`}
                        onClick={() => setFilter('challenges')}
                    >
                        Challenges
                    </button>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        + Create Challenge
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {loading ? (
                    <div className={styles.loader}>Loading...</div>
                ) : filter === 'challenges' ? (
                    <>
                        {/* Promoted Section */}
                        {promotedChallenges.length > 0 && !searchQuery && (
                            <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#ffd700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🚀 Featured Challenges
                                    <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>Boosted by creators</span>
                                </h3>
                                <div className={styles.grid} style={{ marginTop: '1rem' }}>
                                    {promotedChallenges.map(challenge => (
                                        <div key={challenge._id} className={styles.card} style={{ border: '1px solid #ffd700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.1)' }}>
                                            <div className={styles.cardHeader}>
                                                <div className={styles.userSection}>
                                                    <Link href={`/users/${challenge.createdBy?.name || 'user'}`}>
                                                        <div className={styles.avatar}>
                                                            <Image
                                                                src={challenge.createdBy?.avatar && challenge.createdBy.avatar !== '/default-avatar.png' ? challenge.createdBy.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(challenge.createdBy?.name || 'User')}&background=random`}
                                                                alt={challenge.createdBy?.name || 'User'}
                                                                width={40}
                                                                height={40}
                                                            />
                                                        </div>
                                                    </Link>
                                                    <div className={styles.meta}>
                                                        <Link href={`/users/${challenge.createdBy?.name || 'user'}`} className={styles.username}>
                                                            {challenge.createdBy?.name || 'Unknown User'}
                                                        </Link>
                                                        <span className={styles.time}>
                                                            {new Date(challenge.startDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.badge}>{challenge.category}</div>
                                            </div>

                                            <div className={styles.mediaContainer}>
                                                {challenge.videoUrl ? (
                                                    <video src={challenge.videoUrl} controls className={styles.media} />
                                                ) : (
                                                    <Image
                                                        src={challenge.image}
                                                        alt={challenge.title}
                                                        fill
                                                        className={styles.media}
                                                    />
                                                )}
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                                <p className={styles.challengeDescription}>{challenge.description}</p>

                                                <div className={styles.challengeMeta}>
                                                    <span>🏆 Prize: {challenge.prizePool} {challenge.prizeType}</span>
                                                    <span>👥 Participants: {challenge.participants}</span>
                                                    <span>💰 Entry: {challenge.isFree ? 'Free' : `${challenge.entryFee} Coins`}</span>
                                                </div>

                                                <Countdown targetDate={new Date(challenge.status === 'upcoming' ? challenge.startDate : challenge.endDate)} />

                                                {challenge.location?.address && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                                            Location: {challenge.location.address}
                                                        </span>
                                                        {/* Map Link */}
                                                        {challenge.location?.mapUrl && (
                                                            <a
                                                                href={challenge.location.mapUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                                    marginTop: '0.5rem', fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none'
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                📍 View Map
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                    <button
                                                        onClick={() => router.push(`/challenges/${challenge._id}`)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Details & Join
                                                    </button>
                                                    <button
                                                        onClick={() => handleInterested(challenge._id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: interestedChallenges.has(challenge._id) ? '#ffd700' : 'rgba(255,255,255,0.1)',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: interestedChallenges.has(challenge._id) ? '#000' : '#fff'
                                                        }}
                                                        title="Notify Me"
                                                    >
                                                        🔔
                                                    </button>
                                                    <button
                                                        onClick={() => handleFavorite(challenge._id, 'challenge')}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: userChallengeFavorites.has(challenge._id) ? '#ff4081' : 'rgba(255,255,255,0.1)',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: 'white'
                                                        }}
                                                        title="Save/Favorite"
                                                    >
                                                        ⭐
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2rem 0', gridColumn: '1 / -1' }} />
                            </div>
                        )}

                        {/* Regular Challenges */}
                        {regularChallenges.map((challenge) => (
                            <div key={challenge._id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.userSection}>
                                        <Link href={`/users/${challenge.createdBy?.name || 'user'}`}>
                                            <div className={styles.avatar}>
                                                <Image
                                                    src={challenge.createdBy?.avatar && challenge.createdBy.avatar !== '/default-avatar.png' ? challenge.createdBy.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(challenge.createdBy?.name || 'User')}&background=random`}
                                                    alt={challenge.createdBy?.name || 'User'}
                                                    width={40}
                                                    height={40}
                                                />
                                            </div>
                                        </Link>
                                        <div className={styles.meta}>
                                            <Link href={`/users/${challenge.createdBy?.name || 'user'}`} className={styles.username}>
                                                {challenge.createdBy?.name || 'Unknown User'}
                                            </Link>
                                            <div className={styles.time} style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                {challenge.status === 'upcoming' ? 'Starts ' : 'Ends '}
                                                {new Date(challenge.status === 'upcoming' ? challenge.startDate : challenge.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.badge}>{challenge.category}</div>
                                </div>

                                <div className={styles.mediaContainer}>
                                    {challenge.videoUrl ? (
                                        <video src={challenge.videoUrl} controls className={styles.media} />
                                    ) : (
                                        <Image
                                            src={challenge.image}
                                            alt={challenge.title}
                                            fill
                                            className={styles.media}
                                        />
                                    )}
                                </div>

                                <div className={styles.cardFooter}>
                                    <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                    <div className={styles.challengeDescription}>{challenge.description}</div>

                                    <div className={styles.challengeMeta}>
                                        <span>🏆 Prize: {challenge.prizePool} {challenge.prizeType}</span>
                                        <span>👥 {challenge.participants} Joined</span>
                                        <span>💰 {challenge.isFree ? 'Free' : `${challenge.entryFee} Coins`}</span>
                                    </div>

                                    <Countdown targetDate={new Date(challenge.status === 'upcoming' ? challenge.startDate : challenge.endDate)} />

                                    {challenge.location?.address && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>📍 {challenge.location.address}</div>
                                            {challenge.location?.mapUrl && (
                                                <a
                                                    href={challenge.location.mapUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                        marginTop: '0.25rem', fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View on Map ↗
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button
                                            onClick={() => router.push(`/challenges/${challenge._id}`)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Details & Join
                                        </button>
                                        <button
                                            onClick={() => handleInterested(challenge._id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: interestedChallenges.has(challenge._id) ? '#ffd700' : 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: interestedChallenges.has(challenge._id) ? '#000' : '#fff'
                                            }}
                                            title="Notify Me"
                                        >
                                            🔔
                                        </button>
                                        <button
                                            onClick={() => handleFavorite(challenge._id, 'challenge')}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: userChallengeFavorites.has(challenge._id) ? '#ff4081' : 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                color: 'white'
                                            }}
                                            title="Save"
                                        >
                                            ⭐
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub._id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userSection}>
                                    <Link href={`/users/${sub.userId?.username || 'user'}`}>
                                        <div className={styles.avatar}>
                                            <Image
                                                src={sub.userId?.avatar && sub.userId.avatar !== '/default-avatar.png' ? sub.userId.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}&background=random`}
                                                alt={sub.userId?.name || 'User'}
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                    </Link>
                                    <div className={styles.meta}>
                                        <Link href={`/users/${sub.userId?.username || 'user'}`} className={styles.username}>
                                            {sub.userId?.username || 'Unknown User'}
                                        </Link>
                                        <span className={styles.time}>
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.badge}>{sub.challengeId?.title || 'Challenge'}</div>
                            </div>

                            <div className={styles.mediaContainer}>
                                {sub.mediaType === 'video' ? (
                                    <video src={sub.mediaUrl} controls className={styles.media} />
                                ) : (
                                    <Image
                                        src={sub.mediaUrl}
                                        alt="Submission"
                                        fill
                                        className={styles.media}
                                    />
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleVote(sub._id)}
                                        className={`${styles.voteButton} ${userVotes.has(sub._id) ? styles.voted : ''}`}
                                        disabled={votingInProgress.has(sub._id)}
                                    >
                                        <span className={styles.likeIcon}>
                                            {userVotes.has(sub._id) ? '❤️' : '🤍'}
                                        </span>
                                        {sub.votes}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFavorite(sub._id, 'submission');
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
                    ))
                )}
            </div>

            {!loading && submissions.length === 0 && filter !== 'challenges' && (
                <div className={styles.emptyState}>
                    <p>No submissions yet. Be the first to submit!</p>
                </div>
            )}
            {!loading && challenges.length === 0 && filter === 'challenges' && (
                <div className={styles.emptyState}>
                    <p>No challenges found.</p>
                </div>
            )}
        </div>
    );
}
