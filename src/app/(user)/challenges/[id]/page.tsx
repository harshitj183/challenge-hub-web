"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import SubmissionModal from '@/components/challenges/SubmissionModal';
import ShareButton from '@/components/ShareButton';
import CommentSection from '@/components/challenges/CommentSection';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    category: string;
    participants: number;
    status: string;
    image?: string;
    mediaUrl?: string; // New unified media format
    badge: string;
    startDate: string;
    endDate: string;
    deadlineTime: string;
    prizePool: number;
    prizeType: string;
    prizeDetails?: string;
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

    // Core engagement states
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [votingInProgress, setVotingInProgress] = useState<Set<string>>(new Set());

    // New Engagement Features
    const [interested, setInterested] = useState(false);
    const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [boosted, setBoosted] = useState(false);

    // Sponsorship Modal
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [sponsorForm, setSponsorForm] = useState({ amount: 100, roi: 12, creatorCut: 3 });

    useEffect(() => {
        if (params.id) {
            fetchChallengeDetails(params.id as string);
            fetchSubmissions();
        }
        if (session) {
            fetchUserVotes();
        }
    }, [params.id, session]);

    // Timer Logic
    useEffect(() => {
        if (!challenge) return;
        const targetDate = challenge.deadlineTime || challenge.startDate;
        if (!targetDate) return;

        const target = new Date(targetDate).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = target - now;

            if (distance < 0) {
                setTimeLeft("Started/Ended");
                return false; // stop interval
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`);
            return true;
        };

        if (updateTimer()) {
            const interval = setInterval(() => {
                if (!updateTimer()) clearInterval(interval);
            }, 60000); // Update every minute
            return () => clearInterval(interval);
        }
    }, [challenge]);

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
            } else {
                alert(data.error || "Free users are limited to 1 vote per day.");
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

    const toggleSaveVideo = (submissionId: string) => {
        if (!session) {
            alert("Login required to save videos");
            return;
        }
        setSavedVideos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(submissionId)) newSet.delete(submissionId);
            else newSet.add(submissionId);
            return newSet;
        });
    };

    const handleInterestedClick = async () => {
        if (!session) {
            alert('Please login to express interest and receive notifications.');
            router.push('/auth/login');
            return;
        }

        setInterested(!interested);

        if (!interested && 'serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                });
                await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sub)
                });
                console.log('Push subscription saved!');
            } catch (err) {
                console.error('Failed to subscribe for push notifications:', err);
            }
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!challenge) return <div className="error-screen">Challenge not found</div>;

    const isPrize = challenge.badge === 'Prize' || challenge.prizePool > 0 || challenge.prizeType !== 'NONE';
    const mainImg = challenge.mediaUrl || challenge.image || '/images/placeholder.png';

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

            {showSponsorModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}>
                        <h2 className="text-gradient" style={{ marginBottom: '1rem' }}>Sponsor Challenge</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Provide prize money for this challenge. Sponsor funds require mutual approval. Default split terms apply but can be negotiated.
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Funding Amount ($)</label>
                            <input
                                type="number"
                                value={sponsorForm.amount}
                                onChange={e => setSponsorForm({ ...sponsorForm, amount: Number(e.target.value) })}
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Sponsor ROI (%)</label>
                                <input
                                    type="number"
                                    value={sponsorForm.roi}
                                    onChange={e => setSponsorForm({ ...sponsorForm, roi: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Creator Cut (%)</label>
                                <input
                                    type="number"
                                    value={sponsorForm.creatorCut}
                                    onChange={e => setSponsorForm({ ...sponsorForm, creatorCut: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowSponsorModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '0.5rem 1rem' }}>Cancel</button>
                            <button className="btn-primary" onClick={() => {
                                alert("Sponsorship proposal sent for creator approval! (Simulation)");
                                setShowSponsorModal(false);
                            }}>Send Proposal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className={styles.hero}>
                <Image
                    src={mainImg.startsWith('http') ? mainImg : '/images/placeholder.png'}
                    alt={challenge.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <div className={`${styles.badge} ${isPrize ? styles.prizeBadge : styles.normalBadge}`}>
                    {challenge.badge} Challenge
                </div>

                {/* Save Video Action / Top Right */}
                <button
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', padding: '0.5rem 1rem', borderRadius: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                    onClick={() => {
                        if (!session) alert("Please log in to save");
                        else alert("Challenge video added to saved list!");
                    }}
                >
                    ⭐ Save Watch Later
                </button>
            </div>

            <div className={styles.content}>
                {/* Main Info */}
                <div className={styles.mainSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h1>{challenge.title}</h1>
                        <button
                            className="btn-primary"
                            style={{
                                background: boosted ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--gradient-main)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                            onClick={() => {
                                if (!session) alert("Log in to boost");
                                else setBoosted(true);
                            }}
                        >
                            🚀 {boosted ? 'Boosted!' : 'Boost Challenge'}
                        </button>
                    </div>

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
                                {isPrize ? (challenge.prizePool > 0
                                    ? (session?.user?.role === 'admin'
                                        ? `$${challenge.prizePool} (Admin cut: $${(challenge.prizePool * 0.15).toFixed(2)})`
                                        : `$${(challenge.prizePool * 0.85).toFixed(2)}`)
                                    : challenge.prizeDetails || 'Yes')
                                    : 'None'}
                            </span>
                            <span className={styles.statLabel}>Prize Pool {session?.user?.role !== 'admin' && challenge.prizePool > 0 && '(85% Winner)'}</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>
                                {timeLeft || challenge.status.toUpperCase()}
                            </span>
                            <span className={styles.statLabel}>Time Left / Status</span>
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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSaveVideo(sub._id);
                                            }}
                                            style={{
                                                position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                                width: '30px', height: '30px', color: savedVideos.has(sub._id) ? 'var(--accent-primary)' : 'white',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            {savedVideos.has(sub._id) ? '★' : '☆'}
                                        </button>
                                    </div>
                                    <div className={styles.submissionFooter}>
                                        <div className={styles.userInfo}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#333', overflow: 'hidden', position: 'relative' }}>
                                                <Image
                                                    src={sub.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}&background=d4af37&color=000`}
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
                                        <Link href="/purchases/votes" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
                                            Need more votes? Buy a Vote Pack
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {submissions.length === 0 && (
                                <p style={{ color: '#666' }}>No submissions yet. Be the first!</p>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className={styles.commentsSection}>
                        <CommentSection challengeId={challenge._id} />
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className={styles.sidebar}>
                    <div className={styles.actionCard}>
                        <h3>Ready to join?</h3>
                        <p style={{ marginBottom: '1rem', color: '#999', fontSize: '0.9rem' }}>
                            Submit your entry to participate. Or let us know you are watching!
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {session ? (
                                <button
                                    className={styles.joinButton}
                                    onClick={() => setShowModal(true)}
                                >
                                    Join Challenge 🏆
                                </button>
                            ) : (
                                <Link href="/auth/login" style={{ width: '100%' }}>
                                    <button className={styles.joinButton} style={{ width: '100%' }}>
                                        Login to Join
                                    </button>
                                </Link>
                            )}

                            <button
                                onClick={handleInterestedClick}
                                style={{
                                    background: interested ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                    border: '1px solid var(--accent-primary)',
                                    color: 'var(--text-primary)',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {interested ? '👀 Interested' : 'Interested in watching'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.actionCard} style={{ background: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                        <h3 style={{ color: 'var(--accent-primary)' }}>Sponsorship</h3>
                        <p style={{ marginBottom: '1rem', color: '#ccc', fontSize: '0.9rem' }}>
                            Fund the prize pool and earn ROI. Default 12% ROI, 3% to creator. Configurable via two-party sync.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', background: 'var(--accent-primary)', color: 'black' }}
                            onClick={() => setShowSponsorModal(true)}
                        >
                            Propose Sponsorship
                        </button>
                    </div>

                    <div className={styles.actionCard}>
                        <h3>Share Challenge</h3>
                        <p style={{ marginBottom: '1rem', color: '#999', fontSize: '0.9rem' }}>
                            Share this challenge with your friends!
                        </p>
                        <ShareButton
                            title={challenge.title}
                            description={challenge.description}
                            url={`/challenges/${challenge._id}`}
                        />
                    </div>

                    <div className={styles.actionCard}>
                        <h3>Information & Rules</h3>
                        <ul style={{ textAlign: 'left', paddingLeft: '1.5rem', color: '#ccc', lineHeight: '1.8', fontSize: '0.9rem' }}>
                            <li>Standard Platform Policies apply.</li>
                            <li>Free users get 1 vote per challenge/day.</li>
                            <li><Link href="/purchases/votes" style={{ color: 'var(--accent-primary)' }}>Purchase additional votes here.</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
