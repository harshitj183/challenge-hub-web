"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import EditProfileModal from '@/components/profile/EditProfileModal';

interface UserData {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    bio?: string;
    location?: string;
    website?: string;
    instagram?: string;
    stats: {
        totalPoints: number;
        badgesCollected: number;
        challengesEntered: number;
        challengesWon: number;
        followers: number;
        following: number;
        totalLikes: number;
        submissions: number;
    };
    badges?: {
        id: string;
        name: string;
        description: string;
        image: string;
        dateEarned: Date;
    }[];
}

interface Submission {
    _id: string;
    title: string;
    challengeId: { title: string; image: string };
    mediaUrl: string;
    status: string;
    votes: number;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserData | null>(null);
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetchProfile();
            fetchMySubmissions();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [session, status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser({
                    _id: session?.user?.id || '',
                    name: session?.user?.name || 'User',
                    email: session?.user?.email || '',
                    avatar: session?.user?.avatar || '',
                    role: 'user',
                    stats: {
                        totalPoints: 0,
                        badgesCollected: 0,
                        challengesEntered: 0,
                        challengesWon: 0,
                        followers: 0,
                        following: 0,
                        totalLikes: 0,
                        submissions: 0
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const fetchMySubmissions = async () => {
        try {
            const res = await fetch(`/api/submissions?userId=${session?.user?.id}`);
            const data = await res.json();
            if (res.ok) {
                setMySubmissions(data.submissions);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    if (!session) return <div style={{ padding: '2rem' }}>Please log in to view profile.</div>;

    const stats = [
        { label: 'Total Points', value: user?.stats?.totalPoints?.toLocaleString() || '0' },
        { label: 'Submissions', value: user?.stats?.submissions?.toString() || mySubmissions.length.toString() },
        { label: 'Total Likes', value: user?.stats?.totalLikes?.toLocaleString() || '0' },
        { label: 'Followers', value: user?.stats?.followers?.toLocaleString() || '0' },
        { label: 'Following', value: user?.stats?.following?.toLocaleString() || '0' },
    ];

    return (
        <div className={styles.profilePage}>
            {isEditing && user && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditing(false)}
                    onUpdate={fetchProfile}
                />
            )}

            {/* Profile Header */}
            <div className={`glass-card ${styles.profileHeader}`}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                                <Image
                                    key={user?.avatar || 'default'}
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
                                    alt="Avatar"
                                    fill
                                    unoptimized
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div className={styles.userDetails}>
                            <h1>{user?.name}</h1>
                            <p className={styles.email}>📧 {user?.email}</p>

                            {user?.bio && <p style={{ marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>{user.bio}</p>}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                {user?.location && <span>📍 {user.location}</span>}
                                {user?.instagram && <span>📸 @{user.instagram}</span>}
                                {user?.website && <a href={user.website} target="_blank" rel="noreferrer" style={{ color: '#a855f7' }}>🔗 Website</a>}
                            </div>

                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Edit Profile</button>
                        </div>
                    </div>

                    <div className={styles.premiumBadge}>
                        <span className={styles.badgeIcon}>👑</span>
                        <span className={styles.badgeText}>{user?.role === 'creator' ? 'Creator' : 'Member'}</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <p className={styles.statLabel}>{stat.label}</p>
                            <h3 className={styles.statValue}>{stat.value}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges Section */}
            <div className={styles.submissionsSection} style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        My Collection
                    </h2>
                    <span style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {user?.badges?.length || 0} Badges
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {user?.badges && user.badges.length > 0 ? (
                        user.badges.map((badge, idx) => (
                            <div
                                key={idx}
                                className="glass-card"
                                style={{
                                    padding: '2rem 1.5rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                }}
                            >
                                <div style={{
                                    width: 100,
                                    height: 100,
                                    position: 'relative',
                                    marginBottom: '1.5rem',
                                    filter: 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.4))',
                                    transformStyle: 'preserve-3d',
                                    borderRadius: '50%',
                                    overflow: 'hidden'
                                }}>
                                    <Image
                                        src={`/images/badges/${badge.image}`}
                                        alt={badge.name}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                    />
                                </div>

                                <span style={{
                                    fontWeight: '800',
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(to bottom, #fff, #cbd5e1)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    marginBottom: '0.5rem',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {badge.name}
                                </span>

                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    marginBottom: '1rem',
                                    fontFamily: 'monospace'
                                }}>
                                    {new Date(badge.dateEarned).toLocaleDateString()}
                                </span>

                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#a5b4fc',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(99, 102, 241, 0.15)',
                                    lineHeight: '1.4'
                                }}>
                                    {badge.description || 'Rare Achievement'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px', background: 'rgba(255,255,255,0.01)' }}>
                            <p style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: '500' }}>No badges unlocked yet</p>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Complete challenges to build your collection.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* My Submissions Section */}
            <div className={styles.submissionsSection}>
                <h2>My Submissions</h2>

                {/* Submissions Grid */}
                <div className={styles.submissionsGrid}>
                    {mySubmissions.map((submission) => (
                        <div key={submission._id} className={`glass-card ${styles.submissionCard}`}>
                            <div className={styles.submissionImage}>
                                <Image
                                    src={submission.mediaUrl}
                                    alt={submission.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>

                            <div className={styles.submissionContent}>
                                <h4>{submission.title}</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    {submission.challengeId?.title || 'Challenge'}
                                </p>

                                <div className={styles.metricInfo} style={{ marginTop: '0.5rem' }}>
                                    <span style={{ marginRight: '0.5rem' }}>❤️ {submission.votes}</span>
                                    <span className={`status-${submission.status}`}>{submission.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {mySubmissions.length === 0 && (
                        <p style={{ padding: '2rem', color: '#888' }}>You haven't submitted anything yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
