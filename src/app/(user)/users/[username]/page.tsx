"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    points: number;
    role: string;
    bio?: string;
    location?: string;
    website?: string;
    instagram?: string;
    badges: any[];
    stats: any;
    followersCount: number;
    followingCount: number;
    createdAt: string;
}

interface Submission {
    _id: string;
    title: string;
    mediaUrl: string;
    votes: number;
    challengeId: { title: string; category: string };
}

export default function PublicProfilePage() {
    const params = useParams();
    const { data: session } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (params.username) {
            fetchUserProfile();
        }
    }, [params.username]);

    useEffect(() => {
        if (user && session) {
            checkFollowStatus();
        }
    }, [user, session]);

    const fetchUserProfile = async () => {
        try {
            const username = decodeURIComponent(params.username as string).replace('@', '');
            const res = await fetch(`/api/users/${username}`);
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/follow?userId=${user._id}&type=followers`);
            const data = await res.json();
            if (res.ok) {
                const following = data.data.some((f: any) =>
                    f.followerId && f.followerId._id === session?.user?.id
                );
                setIsFollowing(following);
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollow = async () => {
        if (!session) {
            alert('Please login to follow');
            return;
        }

        setFollowLoading(true);
        try {
            const res = await fetch('/api/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?._id })
            });

            const data = await res.json();
            if (res.ok) {
                setIsFollowing(data.action === 'followed');
                setUser(prev => prev ? {
                    ...prev,
                    followersCount: prev.followersCount + (data.action === 'followed' ? 1 : -1)
                } : null);
            }
        } catch (error) {
            console.error('Error following:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.profilePage}>
                <div className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={`${styles.avatarWrapper} skeleton`} style={{ border: 'none' }} />
                    </div>
                    <div className={styles.info}>
                        <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '1rem' }} />
                        <div className={styles.stats}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className={styles.stat}>
                                    <div className="skeleton" style={{ width: '30px', height: '20px', marginBottom: '5px' }} />
                                    <div className="skeleton" style={{ width: '40px', height: '14px' }} />
                                </div>
                            ))}
                        </div>
                        <div className="skeleton" style={{ width: '100%', height: '16px', marginTop: '1rem' }} />
                        <div className="skeleton" style={{ width: '80%', height: '16px', marginTop: '0.5rem' }} />
                    </div>
                </div>
                <div className={styles.grid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '12px' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className={styles.error}>User not found</div>;
    }

    const isOwnProfile = session?.user?.id === user._id;

    return (
        <div className={styles.profilePage}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper}>
                        <Image
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=d4af37&color=000`}
                            alt={user.name}
                            fill
                            unoptimized
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>

                <div className={styles.info}>
                    <div className={styles.topRow}>
                        <h1>{user.name}</h1>
                        {isOwnProfile ? (
                            <Link href="/profile">
                                <button className={styles.editBtn}>Edit Profile</button>
                            </Link>
                        ) : (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{submissions.length}</span>
                            <span className={styles.statLabel}>Posts</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{user.followersCount}</span>
                            <span className={styles.statLabel}>Followers</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{user.followingCount}</span>
                            <span className={styles.statLabel}>Following</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{user.points}</span>
                            <span className={styles.statLabel}>Points</span>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <p className={styles.bio}>{user.bio}</p>
                    )}

                    {/* Links */}
                    <div className={styles.links}>
                        {user.location && <span>📍 {user.location}</span>}
                        {user.website && (
                            <a href={user.website} target="_blank" rel="noreferrer">
                                🔗 {user.website}
                            </a>
                        )}
                    </div>

                    {/* Social Media Links */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {user.instagram && (
                            <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" title="Instagram" style={{ color: '#E1306C', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                        )}
                        {user.tiktok && (
                            <a href={`https://tiktok.com/@${user.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" title="TikTok" style={{ color: '#ff0050', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 3.13-1.13 6.13-3.57 8.09-2.43 1.95-6.19 2.5-9.15 1.05-2.45-1.2-4.11-3.69-4.14-6.42-.1-3.72 2.77-6.9 6.48-7.14V14c-1.58.45-2.88 1.91-2.92 3.52.01 1.25.75 2.51 1.98 2.87 1.79.52 3.86-.49 4.39-2.26.15-.59.18-1.2.18-1.81V.02h2.67z" fill="white"></path></svg>
                            </a>
                        )}
                        {user.twitter && (
                            <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" title="X (Twitter)" style={{ color: '#fff', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                            </a>
                        )}
                        {user.facebook && (
                            <a href={user.facebook.startsWith('http') ? user.facebook : `https://facebook.com/${user.facebook}`} target="_blank" rel="noreferrer" title="Facebook" style={{ color: '#1877F2', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                        )}
                        {user.whatsapp && (
                            <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color: '#25D366', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            </a>
                        )}
                        {user.telegram && (
                            <a href={`https://t.me/${user.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" title="Telegram" style={{ color: '#229ED9', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </a>
                        )}
                    </div>

                    {/* Badges Preview */}
                    {user.badges && user.badges.length > 0 && (
                        <div className={styles.badgesPreview}>
                            {user.badges.slice(0, 5).map((badge, idx) => (
                                <div key={idx} className={styles.badgeIcon} title={badge.name}>
                                    <Image
                                        src={`/images/badges/${badge.image}`}
                                        alt={badge.name}
                                        width={32}
                                        height={32}
                                        unoptimized
                                    />
                                </div>
                            ))}
                            {user.badges.length > 5 && (
                                <span className={styles.moreBadges}>+{user.badges.length - 5}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions Grid */}
            <div className={styles.grid}>
                {submissions.map((sub) => (
                    <Link key={sub._id} href={`/submissions/${sub._id}`}>
                        <div className={styles.gridItem}>
                            <Image
                                src={sub.mediaUrl}
                                alt={sub.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            <div className={styles.overlay}>
                                <span>❤️ {sub.votes}</span>
                                <span>{sub.title}</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {submissions.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No posts yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
