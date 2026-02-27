"use client";
import { useState } from 'react';
import styles from './page.module.css';

const creatorTiers = [
    {
        name: 'Observer',
        tier: 'Free Tier',
        price: '$0',
        period: '/month',
        color: '#808080',
        icon: '👀',
        features: [
            'View public challenges',
            '1 free vote per challenge/day',
            'Comment on public challenges',
            'Create 1 free group challenge/month',
            'Participate in group challenges'
        ]
    },
    {
        name: 'Creator',
        tier: 'For active users',
        price: '$24.99',
        period: '/month',
        color: '#10b981', // Emerald
        icon: '🎬',
        features: [
            '60 votes/month + 1 Multiplier',
            'Create up to 3 group challenges/mo',
            'Prize Pools up to $500',
            '1 Challenge Boost/month',
            'Comment & pin 1 comment'
        ]
    },
    {
        name: 'Competitor',
        tier: 'Serious creators',
        price: '$59.99',
        period: '/month',
        color: '#6366f1', // Indigo
        icon: '⚔️',
        popular: true,
        features: [
            '200 votes + 3 Multipliers',
            'Unlimited free group challenges',
            'Prize Pools up to $2,500 + Host 1v1',
            'Access to Ranked Challenges',
            'Host Small Live Events (10 pax)'
        ]
    },
    {
        name: 'Executive Host',
        tier: 'Event organizers',
        price: '$119',
        period: '/month',
        color: '#f59e0b', // Amber
        icon: '🎪',
        features: [
            '500 votes + 5 Multipliers',
            'Prize Pools up to $10,000',
            'Create Tournament Brackets & 1v1',
            'Unlimited Challenge Boosts',
            'Host Mid-Scale Live Events (15 pax)'
        ]
    },
    {
        name: 'Chief Producer',
        tier: 'Culture architect',
        price: '$249',
        period: '/month',
        color: '#ec4899', // Pink
        icon: '👑',
        features: [
            '1,500 votes + Unlimited Multipliers',
            'Unlimited prize pools & events',
            'Sponsor-integrated challenges',
            'Tier-Restricted Special Events',
            'Host Large Live Events (25 pax)'
        ]
    }
];

const sponsorTiers = [
    {
        name: 'Brand Partner',
        price: '$499',
        period: '/month',
        color: '#3b82f6', // Blue
        icon: '🤝',
        features: [
            'Sponsor up to 5 challenges',
            'Brand badge on listings',
            'Custom CTA button',
            'Engagement dashboard',
            'Access to sponsor-only placements'
        ]
    },
    {
        name: 'Enterprise Sponsor',
        price: '$1,250',
        period: '/month',
        color: '#8b5cf6', // Purple
        icon: '🏢',
        features: [
            'Unlimited sponsored challenges',
            'Logo on challenge feed',
            'Weekly Featured Sponsor banner',
            'Direct ROI analytics',
            'Co-branded live event integration'
        ]
    }
];

export default function SubscriptionsPage() {
    const [activeTab, setActiveTab] = useState<'creators' | 'sponsors'>('creators');

    return (
        <div className={styles.subscriptionsPage}>
            <header className={styles.header}>
                <h1 className="text-gradient">Choose Your Identity</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Unlock the full potential of the Famiglia D&apos;Oro Challenge Suite.
                </p>

                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'creators' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('creators')}
                    >
                        Creators & Competitors
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'sponsors' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('sponsors')}
                    >
                        Brands & Sponsors
                    </button>
                </div>
            </header>

            <div className={styles.pricingSection}>
                {activeTab === 'creators' && (
                    <div className={styles.pricingGrid}>
                        {creatorTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`glass-card ${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}
                                style={{ borderColor: tier.popular ? tier.color : 'rgba(255,255,255,0.1)' }}
                            >
                                {tier.popular && (
                                    <div className={styles.popularBadge} style={{ backgroundColor: tier.color }}>
                                        Recommended
                                    </div>
                                )}

                                <div className={styles.tierHeader}>
                                    <div className={styles.tierIcon} style={{ background: `${tier.color}20`, border: `1px solid ${tier.color}40` }}>
                                        <span style={{ fontSize: '2.5rem' }}>{tier.icon}</span>
                                    </div>
                                    <h3 className={styles.tierName}>{tier.name}</h3>
                                    <p className={styles.tierSubtitle}>{tier.tier}</p>
                                    <div className={styles.tierPrice}>
                                        <span className={styles.price}>{tier.price}</span>
                                        <span className={styles.period}>{tier.period}</span>
                                    </div>
                                </div>

                                <div className={styles.tierFeatures}>
                                    <ul className={styles.featuresList}>
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} style={{ alignItems: 'flex-start' }}>
                                                <span className={styles.checkIcon} style={{ color: tier.color }}>✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className={styles.tierBtn}
                                    style={{
                                        background: tier.popular ? tier.color : 'rgba(255,255,255,0.05)',
                                        color: tier.popular ? '#fff' : tier.color,
                                        border: `1px solid ${tier.color}`
                                    }}
                                >
                                    {tier.price === '$0' ? 'Current Tier' : 'Select Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'sponsors' && (
                    <div className={styles.pricingGrid} style={{ justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
                        {sponsorTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`glass-card ${styles.pricingCard}`}
                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <div className={styles.tierHeader}>
                                    <div className={styles.tierIcon} style={{ background: `${tier.color}20`, border: `1px solid ${tier.color}40` }}>
                                        <span style={{ fontSize: '2.5rem' }}>{tier.icon}</span>
                                    </div>
                                    <h3 className={styles.tierName}>{tier.name}</h3>
                                    <div className={styles.tierPrice}>
                                        <span className={styles.price}>{tier.price}</span>
                                        <span className={styles.period}>{tier.period}</span>
                                    </div>
                                </div>

                                <div className={styles.tierFeatures}>
                                    <ul className={styles.featuresList}>
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx}>
                                                <span className={styles.checkIcon} style={{ color: tier.color }}>✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className={styles.tierBtn}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        color: tier.color,
                                        border: `1px solid ${tier.color}`
                                    }}
                                >
                                    Partner With Us
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
