"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import SubmissionModal from '@/components/challenges/SubmissionModal';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    category: string;
    participants: number;
    status: string;
    image: string;
    badge: string;
    startDate: string;
    endDate: string;
    prize?: { amount: number; description: string };
    createdBy: { name: string };
}

interface Submission {
    _id: string;
    title: string;
    mediaUrl: string;
    votes: number;
    userId: { name: string; avatar: string };
}

export default function ChallengeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [votingInProgress, setVotingInProgress] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (params.id) {
            fetchChallengeDetails(params.id as string);
            fetchSubmissions();
        }
        if (session) {
            fetchUserVotes();
        }
    }, [params.id, session]);

    const fetchChallengeDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/challenges/${id}`);
            const data = await res.json();
            if (res.ok) setChallenge(data.challenge);
        } catch (error) {
            console.error('Error fetching challenge:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        if (!params.id) return;
        try {
            const res = await fetch(`/api/submissions?challengeId=${params.id}`);
            const data = await res.json();
            if (res.ok) {
                console.log('Fetched submissions:', data.submissions);
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
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
                // Update local state
                setSubmissions(prev => prev.map(sub =>
                    sub._id === submissionId
                        ? { ...sub, votes: sub.votes + (data.action === 'added' ? 1 : -1) }
                        : sub
                ));

                // Update user votes
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

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!challenge) return <div className="error-screen">Challenge not found</div>;

    const isPrize = challenge.badge === 'Prize';

    return (
        <div className={styles.container}>
            {showModal && (
                <SubmissionModal
                    challengeId={challenge._id}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchSubmissions();
                    }}
                />
            )}

            {/* Hero Section */}
            <div className={styles.hero}>
                <Image
                    src={challenge.image.startsWith('http') ? challenge.image : '/images/placeholder.png'}
                    alt={challenge.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <div className={`${styles.badge} ${isPrize ? styles.prizeBadge : styles.normalBadge}`}>
                    {challenge.badge} Challenge
                </div>
            </div>

            <div className={styles.content}>
                {/* Main Info */}
                <div className={styles.mainSection}>
                    <h1>{challenge.title}</h1>
                    <div className={styles.description}>
                        {challenge.description}
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{challenge.participants}</span>
                            <span className={styles.statLabel}>Participants</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>
                                {isPrize && challenge.prize ? `$${challenge.prize.amount}` : 'None'}
                            </span>
                            <span className={styles.statLabel}>Prize Pool</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>
                                {challenge.status.toUpperCase()}
                            </span>
                            <span className={styles.statLabel}>Status</span>
                        </div>
                    </div>

                    {/* Submissions Gallery */}
                    <div className={styles.submissionsSection}>
                        <h2>Community Submissions</h2>
                        <div className={styles.submissionsGrid}>
                            {submissions.map(sub => (
                                <div
                                    key={sub._id}
                                    className={styles.submissionCard}
                                    onClick={() => router.push(`/submissions/${sub._id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.submissionImage}>
                                        <Image
                                            src={sub.mediaUrl}
                                            alt={sub.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles.submissionFooter}>
                                        <div className={styles.userInfo}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#333', overflow: 'hidden', position: 'relative' }}>
                                                <Image
                                                    src={sub.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}&background=6366f1&color=fff`}
                                                    alt={sub.userId?.name || 'User'}
                                                    fill
                                                    unoptimized
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '0.9rem' }}>{sub.userId?.name || 'Anonymous User'}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(sub._id);
                                            }}
                                            disabled={votingInProgress.has(sub._id)}
                                            style={{
                                                background: userVotes.has(sub._id) ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'rgba(255,255,255,0.05)',
                                                border: userVotes.has(sub._id) ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                padding: '0.5rem 1rem',
                                                color: '#fff',
                                                cursor: votingInProgress.has(sub._id) ? 'wait' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease',
                                                opacity: votingInProgress.has(sub._id) ? 0.6 : 1,
                                                transform: userVotes.has(sub._id) ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!votingInProgress.has(sub._id)) {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.boxShadow = userVotes.has(sub._id)
                                                        ? '0 4px 15px rgba(236, 72, 153, 0.4)'
                                                        : '0 4px 15px rgba(255,255,255,0.1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = userVotes.has(sub._id) ? 'scale(1.05)' : 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>
                                                {userVotes.has(sub._id) ? '❤️' : '🤍'}
                                            </span>
                                            <span>{sub.votes}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {submissions.length === 0 && (
                                <p style={{ color: '#666' }}>No submissions yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className={styles.sidebar}>
                    <div className={styles.actionCard}>
                        <h3>Ready to join?</h3>
                        <p style={{ marginBottom: '1rem', color: '#999' }}>
                            Submit your entry to participate in this challenge.
                        </p>

                        {session ? (
                            <button
                                className={styles.joinButton}
                                onClick={() => setShowModal(true)}
                            >
                                Upload Submission 📤
                            </button>
                        ) : (
                            <Link href="/auth/login">
                                <button className={styles.joinButton}>
                                    Login to Join
                                </button>
                            </Link>
                        )}
                    </div>

                    <div className={styles.actionCard}>
                        <h3>Rules</h3>
                        <ul style={{ textAlign: 'left', paddingLeft: '1.5rem', color: '#ccc', lineHeight: '1.8' }}>
                            <li>Original content only</li>
                            <li>No NSFW content</li>
                            <li>Follow the theme</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
