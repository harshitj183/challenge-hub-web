"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

interface LeaderboardEntry {
    rank: number;
    userId: { _id: string; name: string; username?: string; avatar: string };
    challengeId: { title: string; badge: string };
    points: number;
    wins: number;
}

export default function LeaderboardsPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All Challenges');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchLeaderboard();
    }, [currentPage, selectedFilter]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/leaderboards?page=${currentPage}&limit=10`);
            const data = await res.json();
            if (res.ok) {
                setLeaderboard(data.leaderboard);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.leaderboardsPage}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Leaderboards</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Top participants across all challenges
                    </p>
                </div>
            </header>

            {/* Filter */}
            <div className={styles.filterSection}>
                <div style={{ position: 'relative' }}>
                    <button
                        className={`${styles.filterBtn} ${styles.active}`}
                        onClick={() => setFilterOpen(!filterOpen)}
                    >
                        📋 {selectedFilter} ▼
                    </button>
                    {filterOpen && (
                        <div className={styles.dropdown}>
                            <button onClick={() => { setSelectedFilter('All Challenges'); setFilterOpen(false); }}>All Challenges</button>
                            {/* Further filters would require API support for specific challenge types */}
                        </div>
                    )}
                </div>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        className={styles.searchInput}
                    />
                    <button className={styles.searchBtn}>Search</button>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div className={styles.tableHeader}>
                    <h3>Global Leaderboard</h3>
                    <div className={styles.pagination}>
                        <span>
                            {totalItems === 0 ? '0-0' : `${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, totalItems)}`} of {totalItems}
                        </span>
                        <div className={styles.paginationBtns}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >←</button>
                            <button className={`${styles.pageBtn} ${styles.active}`}>{currentPage}</button>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={(currentPage * 10) >= totalItems}
                            >→</button>
                        </div>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Challenge</th>
                                    <th>👤 User</th>
                                    <th>Points</th>
                                    <th>Wins</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((item, idx) => (
                                    <tr key={idx} className={item.rank <= 3 ? styles.topThree : ''}>
                                        <td>
                                            <div className={styles.rankCell}>
                                                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.challengeCell}>
                                                {item.challengeId?.badge === 'Prize' && <span className={styles.prizeBadge}>🏆 Prize</span>}
                                                <span>{item.challengeId?.title || 'Global'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/users/${item.userId?.username || item.userId?._id || '#'}`}
                                                className={styles.userCell}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <div style={{ width: 32, height: 32, position: 'relative', borderRadius: '50%', overflow: 'hidden', marginRight: '0.8rem', flexShrink: 0 }}>
                                                    <Image
                                                        src={item.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userId?.name || 'User')}`}
                                                        alt={item.userId?.name || 'User'}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        unoptimized
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className={styles.username} style={{ fontWeight: 500, color: 'white' }}>
                                                        {item.userId?.username ? `@${item.userId.username}` : (item.userId?.name || 'User')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={styles.points}>{item.points.toLocaleString()} pts</span>
                                        </td>
                                        <td>
                                            <span className={styles.wins}>{item.wins}</span>
                                        </td>
                                        <td>
                                            <button className={styles.viewBtn}>→</button>
                                        </td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Bottom Pagination */}
                <div className={styles.bottomPagination}>
                    <button
                        className={styles.navBtn}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >← Prev</button>
                    <button
                        className={`${styles.navBtn} ${styles.primary}`}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={(currentPage * 10) >= totalItems}
                    >Next →</button>
                </div>
            </div>
        </div>
    );
}

