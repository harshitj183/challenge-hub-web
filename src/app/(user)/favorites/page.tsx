"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface Favorite {
    _id: string;
    submissionId: {
        _id: string;
        title: string;
        description?: string;
        mediaUrl: string;
        votes: number;
        userId: { _id: string; name: string; avatar: string; username?: string };
        challengeId: { _id: string; title: string };
    };
    createdAt: string;
}

export default function FavoritesPage() {
    const { data: session } = useSession();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchFavorites();
        }
    }, [session]);

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/favorites');
            const data = await res.json();
            if (res.ok) {
                setFavorites(data.favorites);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (submissionId: string) => {
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId })
            });

            if (res.ok) {
                setFavorites(prev => prev.filter(fav => fav.submissionId._id !== submissionId));
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    return (
        <div className={styles.favoritesPage}>
            <div className={styles.header}>
                <h1>⭐ My Favorites</h1>
                <p>Your saved submissions ({favorites.length})</p>
            </div>

            {favorites.length === 0 ? (
                <div className={styles.emptyState}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>☆</div>
                    <h2>No favorites yet</h2>
                    <p>Start exploring and save your favorite submissions!</p>
                    <Link href="/feed">
                        <button className={styles.exploreBtn}>
                            Explore Feed
                        </button>
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {favorites.map((fav) => {
                        if (!fav.submissionId) return null;

                        return (
                            <div key={fav._id} className={`glass-card ${styles.card}`}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={fav.submissionId.mediaUrl}
                                        alt={fav.submissionId.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    {fav.submissionId.challengeId && (
                                        <Link href={`/challenges/${fav.submissionId.challengeId._id}`}>
                                            <div className={styles.challengeTag}>
                                                {fav.submissionId.challengeId.title}
                                            </div>
                                        </Link>
                                    )}
                                </div>

                                <div className={styles.content}>
                                    <Link href={`/submissions/${fav.submissionId._id}`}>
                                        <h3 className={styles.title}>{fav.submissionId.title}</h3>
                                    </Link>
                                    {fav.submissionId.description && (
                                        <p className={styles.description}>{fav.submissionId.description}</p>
                                    )}

                                    <div className={styles.footer}>
                                        <Link href={`/users/${fav.submissionId.userId.username || fav.submissionId.userId._id}`} className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                <Image
                                                    src={fav.submissionId.userId.avatar}
                                                    alt={fav.submissionId.userId.name}
                                                    fill
                                                    unoptimized
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <span>
                                                {fav.submissionId.userId.username ? `@${fav.submissionId.userId.username}` : fav.submissionId.userId.name}
                                            </span>
                                        </Link>

                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                ❤️ {fav.submissionId.votes}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveFavorite(fav.submissionId._id)}
                                                className={styles.removeBtn}
                                                title="Remove from favorites"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
