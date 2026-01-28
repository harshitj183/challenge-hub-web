"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import StoryFeed from '@/components/StoryFeed';

export default function Dashboard() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, challengesRes, leaderboardRes, activityRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/challenges?status=active&limit=3'),
          fetch('/api/leaderboards?limit=5'),
          fetch('/api/submissions?limit=5') // Fetch recent global activity
        ]);

        if (userRes.ok) {
          const data = await userRes.json();
          setUserData(data.user);
        }

        if (challengesRes.ok) {
          const data = await challengesRes.json();
          setActiveChallenges(data.challenges);
        }

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          setLeaderboard(data.leaderboard);
        }

        if (activityRes.ok) {
          const data = await activityRes.json();
          const activity = data.submissions.map((sub: any) => ({
            user: sub.userId?.username || sub.userId?.name || 'User',
            action: `submitted to ${sub.challengeId?.title || 'a challenge'}`,
            time: new Date(sub.createdAt).toLocaleDateString(),
            icon: '📸'
          }));
          setRecentActivity(activity);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const stats = [
    {
      label: 'Active Challenges',
      value: userData?.stats?.challengesEntered || '0',
      icon: '⚔️',
      subtext: 'In Progress',
      trend: '+0'
    },
    {
      label: 'Points Earned',
      value: (userData?.stats?.totalPoints || 0).toLocaleString(),
      icon: '💎',
      subtext: 'Total Points',
      trend: '+0'
    },
    {
      label: 'Badges Collected',
      value: userData?.badges?.length || '0',
      icon: '🏅',
      subtext: 'Total Earned',
      trend: '+0'
    },
  ];



  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Welcome back, <strong>Harshit</strong>! Ready to take on new challenges?
          </p>
        </div>
        <Link href="/challenges">
          <button className="btn-primary">+ Find Challenge</button>
        </Link>
      </header>

      {/* Enhanced KPI Row */}
      <section className={styles.kpiGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={`glass-card ${styles.statCard}`}>
            <div className={styles.statIcon}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{stat.label}</p>
              <div className={styles.statValue}>
                <h3>{stat.value}</h3>
                <span className={styles.statTrend}>{stat.trend}</span>
              </div>
              <p className={styles.statSubtext}>{stat.subtext}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Story Feed */}
      <StoryFeed />

      {/* Main Grid 60/40 */}
      <div className={styles.mainGrid}>

        {/* Left Column (60%) - Current Challenges */}
        <div className={styles.colMain}>
          <section className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={styles.cardHeader}>
              <div>
                <h3>🔥 Current Challenges</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Track your active challenges
                </p>
              </div>
              <Link href="/challenges" className={styles.viewAllLink}>View All &rarr;</Link>
            </div>

            <div className={styles.challengeGrid}>
              {activeChallenges.length > 0 ? (
                activeChallenges.map((challenge) => {
                  // Fallback for broken picsum images - force local
                  const getChallengeImage = (c: any) => {
                    const cat = c.category?.toLowerCase() || '';
                    if (cat.includes('fitness')) return '/images/fitness.png';
                    if (cat.includes('creative') || cat.includes('art')) return '/images/photography.png';
                    if (cat.includes('lifestyle') || cat.includes('cooking')) return '/images/cooking.png';
                    return '/images/step.png';
                  };

                  return (
                    <div key={challenge._id} className={styles.challengeCard}>
                      <div className={styles.challengeImage}>
                        <Image
                          src={getChallengeImage(challenge)}
                          alt={challenge.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        // Local images are optimized
                        />
                        <span className={styles.challengeTag}>{challenge.category}</span>
                      </div>
                      <div className={styles.challengeContent}>
                        <h4>{challenge.title}</h4>
                        <p className={styles.challengeDesc}>{challenge.description}</p>

                        <div className={styles.challengeMeta}>
                          <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>👥</span>
                            <span>{challenge.participants.toLocaleString()}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>⏳</span>
                            <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className={styles.progressSection}>
                          <div className={styles.progressHeader}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: '0%' }}></div>
                          </div>
                        </div>

                        <Link href={`/challenges/${challenge._id}`}>
                          <button className={styles.challengeBtn}>View Details</button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
                  <p>No active challenges found. Check back later!</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="glass-card" style={{ padding: '1.5rem' }}>
            <div className={styles.cardHeader}>
              <h3>📢 Recent Activity</h3>
            </div>
            <div className={styles.activityList}>
              {recentActivity.map((activity, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <span className={styles.activityIcon}>{activity.icon}</span>
                  <div className={styles.activityContent}>
                    <p>
                      <strong>{activity.user}</strong> {activity.action}
                    </p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (40%) */}
        <div className={styles.colSide}>
          {/* Leaderboard */}
          {/* Leaderboard */}
          <section className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div className={styles.cardHeader}>
              <div>
                <h3>🏆 Top Performers</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Top performers this month
                </p>
              </div>
            </div>

            <div className={styles.leaderboardList}>
              {leaderboard.map((item, idx) => (
                <div
                  key={idx}
                  className={`${styles.leaderboardItem} ${item.userId?._id === session?.user?.id ? styles.highlighted : ''}`}
                >
                  <div className={styles.leaderRank}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <div className={styles.leaderAvatar}>
                    <Image
                      src={item.userId?.avatar || `https://ui-avatars.com/api/?name=${item.userId?.name || 'User'}`}
                      alt={item.userId?.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                      style={{ borderRadius: '50%' }}
                      unoptimized
                    />
                  </div>
                  <div className={styles.leaderInfo}>
                    <span className={styles.leaderName}>
                      {item.userId?.name || 'Unknown'} {item.userId?._id === session?.user?.id ? '(You)' : ''}
                    </span>
                    <span className={styles.leaderPoints}>{item.points?.toLocaleString()} pts</span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/leaderboards">
              <button className={styles.viewFullLeaderboard}>
                View Full Leaderboard →
              </button>
            </Link>
          </section>

          {/* Achievements */}
          <section className="glass-card" style={{ padding: '1.5rem' }}>
            <div className={styles.cardHeader}>
              <h3>🎖️ Recent Badges</h3>
            </div>
            <div className={styles.badgeGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
              {userData?.badges && userData.badges.length > 0 ? (
                userData.badges.slice(0, 6).map((badge: any, idx: number) => (
                  <div
                    key={idx}
                    title={badge.name}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '0.75rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <div style={{ position: 'relative', width: 45, height: 45, marginBottom: '0.4rem', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))', borderRadius: '50%', overflow: 'hidden' }}>
                      <Image
                        src={`/images/badges/${badge.image}`}
                        alt={badge.name}
                        fill
                        style={{ objectFit: 'contain' }}
                        unoptimized
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#e2e8f0', textAlign: 'center', lineHeight: 1.2 }}>{badge.name}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
                  <p>No badges yet. Start participating!</p>
                  <div style={{ opacity: 0.5, marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {/* Show ghostly outlines of badges */}
                    <div className={styles.badgeItem} style={{ filter: 'grayscale(1)' }}>
                      <Image src="/images/badges/first-submission.png" width={50} height={50} alt="Locked" unoptimized />
                    </div>
                    <div className={styles.badgeItem} style={{ filter: 'grayscale(1)' }}>
                      <Image src="/images/badges/challenge-master.png" width={50} height={50} alt="Locked" unoptimized />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link href="/profile" className={styles.viewAllBadges}>View All Badges &rarr;</Link>
          </section>
        </div>

      </div>
    </div>
  );
}
