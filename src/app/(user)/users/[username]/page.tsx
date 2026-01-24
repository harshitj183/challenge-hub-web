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
        return <div className="loading-screen"><div className="spinner"></div></div>;
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
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
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
                        {user.instagram && <span>📸 @{user.instagram}</span>}
                        {user.website && (
                            <a href={user.website} target="_blank" rel="noreferrer">
                                🔗 {user.website}
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
