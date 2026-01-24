"use client";
import styles from './page.module.css';

const pricingTiers = [
    {
        name: 'Bronze',
        price: '$1.99',
        period: '/month',
        color: '#cd7f32',
        icon: '🥉',
        features: [
            'Get glorious acced start!',
            'Access to basic challenges',
            'Community support'
        ]
    },
    {
        name: 'Silver',
        price: '$2.99',
        period: '/month',
        color: '#c0c0c0',
        icon: '🥈',
        features: [
            'Get far enjoy our leads',
            'All Bronze features',
            'Priority support',
            'Advanced analytics'
        ]
    },
    {
        name: 'Gold',
        price: '$3.99',
        period: '/month',
        color: '#ffd700',
        icon: '🥇',
        features: [
            'Earn in gourt completed',
            'All Silver features',
            'Exclusive challenges',
            'Custom badges'
        ],
        popular: true
    },
    {
        name: 'Platinum',
        price: '$4.99',
        period: '/month',
        color: '#e5e4e2',
        icon: '💎',
        features: [
            'Gert pan or a friend',
            'All Gold features',
            'VIP support',
            'Early access to features'
        ]
    },
];

export default function SubscriptionsPage() {
    return (
        <div className={styles.subscriptionsPage}>
            <header className={styles.header}>
                <h1 className="text-gradient">Subscriptions</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Home &gt; Subscriptions
                </p>
            </header>

            {/* Premium Creator Section */}
            <div className={`glass-card ${styles.premiumSection}`}>
                <div className={styles.premiumContent}>
                    <h2>Become a Premium Creator</h2>
                    <ul className={styles.featureList}>
                        <li>✓ Create Prize & Normal challenges</li>
                        <li>✓ Access advanced analytics and insights</li>
                        <li>✓ Stand out with a Premium Creator badge</li>
                        <li>✓ Early access to new features</li>
                    </ul>
                </div>
                <div className={styles.premiumCard}>
                    <div className={styles.premiumBadge}>
                        <span className={styles.badgeIcon}>👑</span>
                        <span className={styles.badgeText}>Premium Creator</span>
                    </div>
                    <div className={styles.premiumPrice}>
                        <span className={styles.price}>$19.99</span>
                        <span className={styles.period}>/month</span>
                    </div>
                    <button className={styles.subscribeBtn}>Subscribe</button>
                    <div className={styles.premiumIllustration}>
                        <span style={{ fontSize: '4rem' }}>👑</span>
                        <span style={{ fontSize: '3rem' }}>💎</span>
                        <span style={{ fontSize: '2.5rem' }}>⭐</span>
                    </div>
                </div>
            </div>

            {/* Pricing Tiers */}
            <div className={styles.pricingSection}>
                <h2 className={styles.sectionTitle}>Participate in Prize Challenges</h2>
                <p className={styles.sectionSubtitle}>
                    Enter Prize Challenges and compete for rewards!
                </p>

                <div className={styles.pricingGrid}>
                    {pricingTiers.map((tier, index) => (
                        <div
                            key={index}
                            className={`glass-card ${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}
                        >
                            {tier.popular && (
                                <div className={styles.popularBadge}>Most Popular</div>
                            )}

                            <div className={styles.tierHeader}>
                                <div className={styles.tierIcon} style={{ background: `${tier.color}30` }}>
                                    <span style={{ fontSize: '2.5rem' }}>{tier.icon}</span>
                                </div>
                                <h3 className={styles.tierName}>{tier.name}</h3>
                                <div className={styles.tierPrice}>
                                    <span className={styles.price}>{tier.price}</span>
                                    <span className={styles.period}>{tier.period}</span>
                                </div>
                            </div>

                            <div className={styles.tierFeatures}>
                                <h4 className={styles.featuresTitle}>{tier.name}</h4>
                                <p className={styles.featuresPrice}>
                                    {tier.price}<span className={styles.period}>{tier.period}</span>
                                </p>
                                <ul className={styles.featuresList}>
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <span className={styles.checkIcon}>📊</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                className={styles.tierBtn}
                                style={{
                                    background: tier.popular ? '#ffd700' : tier.color,
                                    color: tier.name === 'Gold' ? '#000' : '#fff'
                                }}
                            >
                                Subscribe
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
