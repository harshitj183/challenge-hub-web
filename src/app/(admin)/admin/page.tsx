"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface AdminStats {
    totalChallenges: number;
    totalUsers: number;
    totalSubmissions: number;
    activeChallenges: number;
    trends: {
        challenges: number;
        users: number;
        submissions: number;
    };
}

interface Challenge {
    id: string;
    name: string;
    status: string;
    participants: number;
    duration: string;
}

interface Leader {
    rank: number;
    name: string;
    points: number;
    challenges: number;
}

interface Activity {
    user: string;
    action: string;
    time: string;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentChallenges, setRecentChallenges] = useState<Challenge[]>([]);
    const [topLeaders, setTopLeaders] = useState<Leader[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchAdminData();
        }
    }, [status, session, router]);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stats');
            const data = await res.json();

            if (res.ok) {
                setStats(data.stats);
                setRecentChallenges(data.recentChallenges);
                setTopLeaders(data.topLeaders);
                setRecentActivity(data.recentActivity);
            } else {
                console.error('Failed to fetch admin data:', data.error);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Failed to load dashboard data</p>
                </div>
            </div>
        );
    }

    const adminStats = [
        { label: 'Total Challenges', value: stats.totalChallenges.toString(), icon: '⚔️', trend: `+${stats.trends.challenges}`, color: '#6366f1' },
        { label: 'Active Challenges', value: stats.activeChallenges.toString(), icon: '🔥', trend: 'Live', color: '#10b981' },
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: '👤', trend: `+${stats.trends.users}`, color: '#f59e0b' },
        { label: 'Total Submissions', value: stats.totalSubmissions.toLocaleString(), icon: '🎯', trend: `+${stats.trends.submissions}`, color: '#8b5cf6' },
    ];

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Monitor and manage your challenge platform
                    </p>
                </div>
                <button className="btn-primary">+ Create Challenge</button>
            </header>

            {/* Stats Grid */}
            <section className={styles.statsGrid}>
                {adminStats.map((stat, index) => (
                    <div key={index} className={`glass-card ${styles.statCard}`}>
                        <div className={styles.statIcon} style={{ background: `${stat.color}20` }}>
                            <span style={{ fontSize: '1.8rem' }}>{stat.icon}</span>
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>{stat.label}</p>
                            <div className={styles.statValue}>
                                <h3>{stat.value}</h3>
                                <span className={styles.statTrend}>{stat.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Main Content Grid */}
            <div className={styles.mainGrid}>
                {/* Recent Challenges */}
                <div className={styles.colMain}>
                    <section className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <h3>📋 Recent Challenges</h3>
                            <a href="/admin/challenges" className={styles.viewAllLink}>View All →</a>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Challenge Name</th>
                                        <th>Status</th>
                                        <th>Participants</th>
                                        <th>Duration</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentChallenges.map((challenge, idx) => (
                                        <tr key={idx}>
                                            <td className={styles.challengeName}>{challenge.name}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[challenge.status.toLowerCase()]}`}>
                                                    {challenge.status}
                                                </span>
                                            </td>
                                            <td>{challenge.participants.toLocaleString()}</td>
                                            <td>{challenge.duration}</td>
                                            <td>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => router.push(`/admin/challenges/edit/${challenge.id}`)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Challenge Analytics Chart Placeholder */}
                    <section className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <h3>📊 Challenge Analytics</h3>
                        </div>
                        <div className={styles.chartPlaceholder}>
                            <p style={{ color: 'var(--text-secondary)' }}>Weekly Activity Summary</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#818cf8', display: 'block', marginBottom: '0.5rem' }}>New Users</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>{stats.trends.users}</span>
                                </div>
                                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#c084fc', display: 'block', marginBottom: '0.5rem' }}>Submissions</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>{stats.trends.submissions}</span>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'block', marginBottom: '0.5rem' }}>Challenges</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>{stats.trends.challenges}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className={styles.colSide}>
                    {/* Top Challenge Leaders */}
                    <section className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <h3>🏆 Top Challenge Leaders</h3>
                        </div>
                        <div className={styles.leadersList}>
                            {topLeaders.map((leader, idx) => (
                                <div key={idx} className={styles.leaderItem}>
                                    <div className={styles.leaderRank}>
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                    </div>
                                    <div className={styles.leaderInfo}>
                                        <span className={styles.leaderName}>{leader.name}</span>
                                        <span className={styles.leaderMeta}>{leader.challenges} challenges</span>
                                    </div>
                                    <span className={styles.leaderPoints}>{leader.points.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <button className={styles.viewFullBtn}>View Full Leaderboard →</button>
                    </section>

                    {/* Recent Activity */}
                    <section className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <h3>📢 Recent Activity</h3>
                        </div>
                        <div className={styles.activityList}>
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className={styles.activityItem}>
                                    <div className={styles.activityDot}></div>
                                    <div className={styles.activityContent}>
                                        <p>
                                            <strong>{activity.user}</strong> {activity.action}
                                        </p>
                                        <span className={styles.activityTime}>{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a href="#" className={styles.viewAllActivity}>View All Activity →</a>
                    </section>
                </div>
            </div>
        </div>
    );
}
