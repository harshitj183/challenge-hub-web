"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [landingStats, setLandingStats] = useState({
        users: '10K+',
        challenges: '500+',
        prizes: '$50K+',
        submissions: '100K+'
    });

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    setLandingStats({
                        users: data.stats.totalUsers > 100 ? `${data.stats.totalUsers}+` : data.stats.totalUsers.toString(),
                        challenges: data.stats.totalChallenges > 50 ? `${data.stats.totalChallenges}+` : data.stats.totalChallenges.toString(),
                        prizes: `$${data.stats.totalPrizes.toLocaleString()}+`,
                        submissions: data.stats.totalSubmissions > 100 ? `${data.stats.totalSubmissions}+` : data.stats.totalSubmissions.toString()
                    });
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (session) {
            if (session.user?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    }, [session, router]);

    if (status === 'loading') {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    if (session) {
        return null; // Will redirect
    }

    return (
        <div className={styles.landingPage}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Welcome to <span className="text-gradient">ChallengeSuite</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Join creative challenges, showcase your talent, and compete with a global community
                    </p>
                    <div className={styles.heroCta}>
                        <Link href="/auth/register">
                            <button className={styles.primaryBtn}>
                                Get Started Free 🚀
                            </button>
                        </Link>
                        <Link href="/auth/login">
                            <button className={styles.secondaryBtn}>
                                Sign In
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Floating Cards Animation */}
                <div className={styles.heroVisual}>
                    <div className={`${styles.floatingCard} ${styles.card1}`}>
                        <div className={styles.cardIcon}>🎨</div>
                        <div className={styles.cardText}>Creative Challenges</div>
                    </div>
                    <div className={`${styles.floatingCard} ${styles.card2}`}>
                        <div className={styles.cardIcon}>🏆</div>
                        <div className={styles.cardText}>Win Prizes</div>
                    </div>
                    <div className={`${styles.floatingCard} ${styles.card3}`}>
                        <div className={styles.cardIcon}>👥</div>
                        <div className={styles.cardText}>Global Community</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <h2 className={styles.sectionTitle}>Why Join ChallengeSuite?</h2>
                <div className={styles.featureGrid}>
                    <div className={`glass-card ${styles.featureCard}`}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3>Daily Challenges</h3>
                        <p>New creative challenges every day across photography, art, fitness, and more</p>
                    </div>
                    <div className={`glass-card ${styles.featureCard}`}>
                        <div className={styles.featureIcon}>🎖️</div>
                        <h3>Earn Badges</h3>
                        <p>Unlock achievements and showcase your skills with exclusive badges</p>
                    </div>
                    <div className={`glass-card ${styles.featureCard}`}>
                        <div className={styles.featureIcon}>📊</div>
                        <h3>Leaderboards</h3>
                        <p>Compete globally and climb the ranks to become a top creator</p>
                    </div>
                    <div className={`glass-card ${styles.featureCard}`}>
                        <div className={styles.featureIcon}>💰</div>
                        <h3>Win Prizes</h3>
                        <p>Participate in premium challenges with cash prizes and rewards</p>
                    </div>
                    <div className={`glass-card ${styles.featureCard}`}>
                        <div className={styles.featureIcon}>🌟</div>
                        <h3>Get Discovered</h3>
                        <p>Showcase your work to thousands of community members</p>
                    </div>
                    <div className={`glass-card ${styles.featureCard}`}>
                        <div className={styles.featureIcon}>🤝</div>
                        <h3>Community</h3>
                        <p>Connect with like-minded creators and grow together</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.stats}>
                <div className={styles.statItem}>
                    <div className={styles.statNumber}>{landingStats.users}</div>
                    <div className={styles.statLabel}>Active Users</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statNumber}>{landingStats.challenges}</div>
                    <div className={styles.statLabel}>Challenges</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statNumber}>{landingStats.prizes}</div>
                    <div className={styles.statLabel}>Prizes Won</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statNumber}>{landingStats.submissions}</div>
                    <div className={styles.statLabel}>Submissions</div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <h2>Ready to Start Your Journey?</h2>
                <p>Join thousands of creators showcasing their talent</p>
                <Link href="/auth/register">
                    <button className={styles.ctaBtn}>
                        Create Free Account
                    </button>
                </Link>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>&copy; 2024 ChallengeSuite. All rights reserved.</p>
            </footer>
        </div>
    );
}
