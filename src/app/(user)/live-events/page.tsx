"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface LiveEvent {
    _id: string;
    title: string;
    description: string;
    image: string;
    startDate: string;
    location: { address: string; mapUrl?: string };
    participants: number;
    host: { name: string; avatar: string; isVerifiedHost: boolean };
    status: 'upcoming' | 'live' | 'ended';
    insuranceVerified: boolean;
}

const HostApplicationModal = ({ setShowHostModal }: { setShowHostModal: (show: boolean) => void }) => (
    <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
            <h2 className="text-gradient" style={{ marginBottom: '1rem' }}>Host a Live Event</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                To host paid, in-person live challenges, you must be a Verified Host and upload required documentation for safety and compliance.
            </p>

            <div className={styles.docUploadSection}>
                <div className={styles.uploadBox}>
                    <h4>🛡️ Liability Insurance</h4>
                    <p>Upload proof of event insurance.</p>
                    <input type="file" className={styles.fileInput} />
                </div>

                <div className={styles.uploadBox}>
                    <h4>🏢 Venue Agreement</h4>
                    <p>Upload signed contract with the venue.</p>
                    <input type="file" className={styles.fileInput} />
                </div>

                <div className={styles.uploadBox}>
                    <h4>👮 Security Plan</h4>
                    <p>Detail your security and emergency protocol.</p>
                    <input type="file" className={styles.fileInput} />
                </div>
            </div>

            <div className={styles.modalActions}>
                <button onClick={() => setShowHostModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button
                    onClick={() => {
                        alert("Application submitted! Our team will review your documents within 48 hours to grant 'Verified Host' status.");
                        setShowHostModal(false);
                    }}
                    className="btn-primary"
                >
                    Submit Application
                </button>
            </div>
        </div>
    </div>
);

export default function LiveChallengesPage() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<LiveEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHostModal, setShowHostModal] = useState(false);

    useEffect(() => {
        // Mock data fetch - In reality, would fetch challenges with type: 'IN_PERSON'
        const mockEvents: LiveEvent[] = [
            {
                _id: '1',
                title: 'Summer Miami Fitness Showdown',
                description: 'In-person live fitness competition at South Beach.',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
                startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                location: { address: 'South Beach, Miami, FL' },
                participants: 120,
                host: { name: 'FitnessKing', avatar: '', isVerifiedHost: true },
                status: 'upcoming',
                insuranceVerified: true
            },
            {
                _id: '2',
                title: 'NYC Gaming LAN Tournament',
                description: 'Local area network tournament for top gamers.',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
                startDate: new Date(Date.now() - 3600000).toISOString(),
                location: { address: 'Barclays Center, Brooklyn, NY' },
                participants: 45,
                host: { name: 'GamerPro', avatar: '', isVerifiedHost: true },
                status: 'live',
                insuranceVerified: true
            }
        ];

        setTimeout(() => {
            setEvents(mockEvents);
            setLoading(false);
        }, 500);
    }, []);



    return (
        <div className={styles.container}>
            {showHostModal && <HostApplicationModal setShowHostModal={setShowHostModal} />}

            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="text-gradient">Live In-Person Events</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Discover offline competitions and physical gatherings.
                        </p>
                    </div>
                    {session && (
                        <button
                            className="btn-primary"
                            onClick={() => setShowHostModal(true)}
                        >
                            Become a Verified Host
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Loading live events...</div>
            ) : (
                <div className={styles.grid}>
                    {events.map((event) => (
                        <div key={event._id} className={styles.card}>
                            <div className={styles.imageContainer}>
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                {event.status === 'live' && (
                                    <div className={styles.liveBadge}>🔴 LIVE NOW</div>
                                )}
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.hostInfo}>
                                    <span style={{ fontWeight: 'bold' }}>Hosted by: {event.host.name}</span>
                                    {event.host.isVerifiedHost && (
                                        <span className={styles.verifiedBadge} title="Verified Host with Insurance & Security cleared">
                                            ✅ Verified
                                        </span>
                                    )}
                                </div>

                                <h3 className={styles.title}>{event.title}</h3>
                                <p className={styles.description}>{event.description}</p>

                                <div className={styles.metaData}>
                                    <div className={styles.metaItem}>
                                        <span>📍</span>
                                        <span>{event.location.address}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span>📅</span>
                                        <span>{new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span>👥</span>
                                        <span>{event.participants} Attending</span>
                                    </div>
                                </div>

                                <button className={styles.attendBtn}>
                                    Register to Attend
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
