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
    tiktok?: string;
    twitter?: string;
    facebook?: string;
    whatsapp?: string;
    telegram?: string;
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

    // if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    if (!session && !loading) return <div style={{ padding: '2rem' }}>Please log in to view profile.</div>;

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
                            {loading ? (
                                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                            ) : (
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
                            )}
                        </div>
                        <div className={styles.userDetails}>
                            {loading ? (
                                <>
                                    <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '8px' }} />
                                    <div className="skeleton" style={{ width: '150px', height: '16px', marginBottom: '8px' }} />
                                    <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
                                </>
                            ) : (
                                <>
                                    <h1>{user?.name}</h1>
                                    <p className={styles.email}>📧 {user?.email}</p>

                                    {user?.bio && <p style={{ marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>{user.bio}</p>}

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                        {user?.location && <span title="Location">📍 {user.location}</span>}
                                        {user?.website && <a href={user.website} target="_blank" rel="noreferrer" style={{ color: '#a855f7' }} title="Website">🔗 Website</a>}
                                    </div>

                                    {/* Social Media Links */}
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {user?.instagram && (
                                            <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" title="Instagram" style={{ color: '#E1306C', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                            </a>
                                        )}
                                        {user?.tiktok && (
                                            <a href={`https://tiktok.com/@${user.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" title="TikTok" style={{ color: '#ff0050', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 3.13-1.13 6.13-3.57 8.09-2.43 1.95-6.19 2.5-9.15 1.05-2.45-1.2-4.11-3.69-4.14-6.42-.1-3.72 2.77-6.9 6.48-7.14V14c-1.58.45-2.88 1.91-2.92 3.52.01 1.25.75 2.51 1.98 2.87 1.79.52 3.86-.49 4.39-2.26.15-.59.18-1.2.18-1.81V.02h2.67z" fill="white"></path></svg>
                                            </a>
                                        )}
                                        {user?.twitter && (
                                            <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" title="X (Twitter)" style={{ color: '#fff', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                            </a>
                                        )}
                                        {user?.facebook && (
                                            <a href={user.facebook.startsWith('http') ? user.facebook : `https://facebook.com/${user.facebook}`} target="_blank" rel="noreferrer" title="Facebook" style={{ color: '#1877F2', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                            </a>
                                        )}
                                        {user?.whatsapp && (
                                            <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color: '#25D366', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                            </a>
                                        )}
                                        {user?.telegram && (
                                            <a href={`https://t.me/${user.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" title="Telegram" style={{ color: '#229ED9', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                            </a>
                                        )}
                                    </div>

                                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Edit Profile</button>
                                </>
                            )}
                        </div>
                    </div>

                    {!loading && (
                        <div className={styles.premiumBadge}>
                            <span className={styles.badgeIcon}>👑</span>
                            <span className={styles.badgeText}>{user?.role === 'creator' ? 'Creator' : 'Member'}</span>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={styles.statCard}>
                                <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '6px' }} />
                                <div className="skeleton" style={{ width: '40%', height: '20px' }} />
                            </div>
                        ))
                    ) : (
                        stats.map((stat, index) => (
                            <div key={index} className={styles.statCard}>
                                <p className={styles.statLabel}>{stat.label}</p>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Badges Section */}
            <div className={styles.submissionsSection} style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        My Collection
                    </h2>
                    {!loading && (
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
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="glass-card skeleton" style={{ height: '300px', borderRadius: '24px' }} />
                        ))
                    ) : user?.badges && user.badges.length > 0 ? (
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
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`glass-card ${styles.submissionCard} skeleton`} style={{ height: '300px' }} />
                        ))
                    ) : mySubmissions.map((submission) => (
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
                    {!loading && mySubmissions.length === 0 && (
                        <p style={{ padding: '2rem', color: '#888' }}>You haven't submitted anything yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
