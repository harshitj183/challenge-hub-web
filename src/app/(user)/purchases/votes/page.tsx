"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface VotePack {
    id: string;
    name: string;
    votes: number;
    price: number;
    bonus?: string;
    popular?: boolean;
}

export default function VotePurchasePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [userCoins, setUserCoins] = useState(150); // Mock starting balance

    const votePacks: VotePack[] = [
        { id: '1', name: 'Starter Pack', votes: 10, price: 4.99, bonus: 'No Bonus' },
        { id: '2', name: 'Supporter Pack', votes: 50, price: 19.99, bonus: '+10 Bonus Votes', popular: true },
        { id: '3', name: 'Superfan Pack', votes: 100, price: 34.99, bonus: '+25 Bonus Votes' },
        { id: '4', name: 'Ultimate Pack', votes: 200, price: 59.99, bonus: '+50 Bonus Votes (Includes 1 Flash Boost)' }
    ];

    const handleWatchAd = () => {
        if (!session) {
            alert('Please log in privileges.');
            router.push('/auth/login');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            alert('Simulating 30-second Video Ad... \n\n✅ You earned 5 free coins!');
            setUserCoins(prev => prev + 5);
            setLoading(false);
        }, 1500);
    };

    const handlePurchase = async (pack: VotePack) => {
        if (!session) {
            alert('Please login to purchase votes.');
            router.push('/auth/login');
            return;
        }

        setLoading(true);
        // Simulate purchase flow
        setTimeout(() => {
            alert(`Purchase simulated successfully! You bought the ${pack.name}`);
            setLoading(false);
        }, 1500);
    };

    const handleBoostPurchase = (boostName: string, coinPrice: number) => {
        if (!session) {
            alert('Please login to purchase boosts.');
            router.push('/auth/login');
            return;
        }
        if (userCoins < coinPrice) {
            alert(`Not enough coins! You need ${coinPrice - userCoins} more coins.`);
            return;
        }
        alert(`Successfully purchased: ${boostName} for ${coinPrice} coins!`);
        setUserCoins(prev => prev - coinPrice);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="text-gradient">Purchase Votes & Power-Ups</h1>
                <p>Support your favorite creators and dominate the leaderboard</p>

                {session && (
                    <div className={styles.balanceCard}>
                        <span className={styles.balanceLabel}>Your Balance</span>
                        <span className={styles.balanceAmount}>🪙 {userCoins} Coins</span>
                    </div>
                )}
            </div>

            {/* Free Coins Section */}
            <div className={styles.freeCoinsSection}>
                <div className={styles.adBanner}>
                    <div className={styles.adInfo}>
                        <h3>📺 Earn Free Coins</h3>
                        <p>Watch short sponsored videos to earn free coins. Use them to buy boosts!</p>
                    </div>
                    <button className={styles.watchAdBtn} onClick={handleWatchAd} disabled={loading}>
                        {loading ? 'Loading Ad...' : '▶ Watch Video (Earn 5 🪙)'}
                    </button>
                </div>
            </div>

            {/* Vote Packs Grid */}
            <h2 className={styles.sectionTitle}>Vote Packs (USD)</h2>
            <div className={styles.packGrid}>
                {votePacks.map(pack => (
                    <div key={pack.id} className={`${styles.packCard} ${pack.popular ? styles.popularPack : ''}`}>
                        {pack.popular && <div className={styles.popularBadge}>Most Popular</div>}
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🗳️</div>
                        <h3 className={styles.packName}>{pack.name}</h3>
                        <div className={styles.voteAmount}>
                            {pack.votes} <span style={{ fontSize: '1rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Votes</span>
                        </div>
                        {pack.bonus && pack.bonus !== 'No Bonus' && (
                            <div className={styles.bonusText}>🎁 {pack.bonus}</div>
                        )}
                        <div className={styles.priceContainer}>
                            <span className={styles.price}>${pack.price}</span>
                        </div>
                        <button
                            className={styles.buyBtn}
                            onClick={() => handlePurchase(pack)}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Purchase Pack'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Premium Features Section */}
            <h2 className={styles.sectionTitle} style={{ marginTop: '4rem' }}>Temporary Boosts (Coins)</h2>
            <div className={styles.boostsGrid}>
                <div className={styles.boostCard}>
                    <div className={styles.boostIcon}>⚡</div>
                    <h4>Flash Amplifier</h4>
                    <p>Doubles the weight of your votes for 1 hour.</p>
                    <button className={styles.boostBtn} onClick={() => handleBoostPurchase('Flash Amplifier', 20)}>Buy (20 🪙)</button>
                </div>
                <div className={styles.boostCard}>
                    <div className={styles.boostIcon}>👑</div>
                    <h4>Domination Window</h4>
                    <p>Pins a submission to the top of Trending for 15 minutes.</p>
                    <button className={styles.boostBtn} style={{ background: 'var(--gradient-main)', border: 'none', color: 'black' }} onClick={() => handleBoostPurchase('Domination Window', 50)}>Buy (50 🪙)</button>
                </div>
                <div className={styles.boostCard}>
                    <div className={styles.boostIcon}>⏳</div>
                    <h4>Overtime Mode</h4>
                    <p>Extends a challenge deadline by 24 hours.</p>
                    <button className={styles.boostBtn} onClick={() => handleBoostPurchase('Overtime Mode', 100)}>Buy (100 🪙)</button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>Votes and Coins purchased do not expire. They can be used on any public or private challenge.</p>
            </div>
        </div>
    );
}
