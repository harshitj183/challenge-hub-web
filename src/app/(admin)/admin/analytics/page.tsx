
"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

interface AnalyticsData {
    userGrowth: { date: string; count: number }[];
    challengeStats: { status: string; count: number }[];
    submissionTrend: { date: string; count: number }[];
    topCategories: { category: string; count: number }[];
    totalUsers: number;
    totalSubmissions: number;
}

export default function AdminAnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchAnalytics();
            // Poll every 10 seconds for "realtime" feel
            const interval = setInterval(fetchAnalytics, 10000);
            return () => clearInterval(interval);
        }
    }, [status, session, router]);

    const fetchAnalytics = async () => {
        try {
            if (!analytics) setLoading(true);
            const [usersRes, challengesRes, submissionsRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/challenges?limit=100'),
                fetch('/api/submissions?limit=100'),
            ]);

            const [statsData, challengesData, submissionsData] = await Promise.all([
                usersRes.json(),
                challengesRes.json(),
                submissionsRes.json(),
            ]);

            const challengeStats = [
                { status: 'Active', count: challengesData.challenges?.filter((c: any) => c.status === 'active').length || 0 },
                { status: 'Upcoming', count: challengesData.challenges?.filter((c: any) => c.status === 'upcoming').length || 0 },
                { status: 'Ended', count: challengesData.challenges?.filter((c: any) => c.status === 'ended').length || 0 },
            ];

            const categoryCount: Record<string, number> = {};
            challengesData.challenges?.forEach((c: any) => {
                categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
            });

            const topCategories = Object.entries(categoryCount)
                .map(([category, count]) => ({ category, count: count as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setAnalytics({
                userGrowth: [],
                challengeStats,
                submissionTrend: [],
                topCategories,
                totalUsers: statsData.stats?.totalUsers || 0,
                totalSubmissions: statsData.stats?.totalSubmissions || 0,
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    const totalChallenges = analytics?.challengeStats.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const activeChallenges = analytics?.challengeStats.find(s => s.status === 'Active')?.count || 0;
    const engagementRate = analytics?.totalUsers ? Math.round((analytics.totalSubmissions / analytics.totalUsers) * 10) / 10 : 0;

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-gradient">Platform Analytics</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                            Real-time performance metrics and insights
                        </p>
                    </div>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            background: '#10b981',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px #10b981'
                        }}></span>
                        <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Live Data</span>
                    </div>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Total Users', value: analytics?.totalUsers, change: '+12%', color: '#6366f1', icon: '👥' },
                    { label: 'Total Submissions', value: analytics?.totalSubmissions, change: '+5%', color: '#ec4899', icon: '📸' },
                    { label: 'Active Challenges', value: activeChallenges, change: 'Now', color: '#10b981', icon: '🔥' },
                    { label: 'Avg. Engagement', value: engagementRate, suffix: ' subs/user', color: '#f59e0b', icon: '📊' }
                ].map((stat, idx) => (
                    <div key={idx} className="glass-card-hover" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '1rem',
                            opacity: 0.1,
                            fontSize: '3rem',
                            filter: 'grayscale(100%)'
                        }}>
                            {stat.icon}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                                {stat.value?.toLocaleString() || 0}
                            </h2>
                            {stat.suffix && <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{stat.suffix}</span>}
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            color: stat.color,
                            background: `${stat.color}15`,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            width: 'fit-content'
                        }}>
                            <span>{stat.change?.includes('+') ? '↗' : '•'}</span>
                            {stat.change || '0%'}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                {/* Main Content - Categories Chart */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>🏆 Top Performing Categories</h3>
                        <button style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#94a3b8',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}>Last 30 Days</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {analytics?.topCategories.map((cat, idx) => {
                            const maxVal = analytics.topCategories[0]?.count || 1;
                            const percentage = (cat.count / maxVal) * 100;

                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '120px', fontWeight: 500, color: '#e2e8f0' }}>{cat.category}</div>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, #6366f1 0%, #a855f7 100%)`,
                                            borderRadius: '4px',
                                            transition: 'width 1s ease-out'
                                        }} />
                                    </div>
                                    <div style={{ width: '40px', textAlign: 'right', fontWeight: 600, color: 'white' }}>{cat.count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side Content - Challenge Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', flex: 1 }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>📊 Challenge Status</h3>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '200px',
                            position: 'relative'
                        }}>
                            {/* Simple CSS Donut Chart Visualization */}
                            <div style={{
                                width: '160px',
                                height: '160px',
                                borderRadius: '50%',
                                background: `conic-gradient(
                                    #10b981 0% ${(activeChallenges / totalChallenges) * 100}%, 
                                    #f59e0b 0% ${((activeChallenges + (analytics?.challengeStats.find(s => s.status === 'Upcoming')?.count || 0)) / totalChallenges) * 100}%, 
                                    #64748b 0% 100%
                                )`,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    background: '#09090b', // match card bg
                                    borderRadius: '50%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{totalChallenges}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></span>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }}></span>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Upcoming</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#64748b' }}></span>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Ended</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
