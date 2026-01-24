"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../page.module.css';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    status: string;
    image: string;
    badge: string;
    participants: number;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export default function AdminChallengesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchChallenges();
        }
    }, [status, session, router]);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/challenges?limit=100');
            const data = await res.json();

            if (res.ok) {
                setChallenges(data.challenges);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this challenge?')) return;

        try {
            const res = await fetch(`/api/challenges/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setChallenges(challenges.filter(c => c._id !== id));
                alert('Challenge deleted successfully!');
            } else {
                alert('Failed to delete challenge');
            }
        } catch (error) {
            console.error('Error deleting challenge:', error);
            alert('Error deleting challenge');
        }
    };

    const filteredChallenges = challenges.filter(challenge => {
        const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || challenge.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading || status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading challenges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Challenge Management</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Create, edit, and manage all challenges
                    </p>
                </div>
                <button className="btn-primary" onClick={() => router.push('/admin/challenges/create')}>
                    + Create Challenge
                </button>
            </header>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['all', 'active', 'upcoming', 'ended'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: filter === f ? 'var(--gradient-main)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Challenges Grid */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>
                    All Challenges ({filteredChallenges.length})
                </h3>

                {filteredChallenges.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No challenges found
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {filteredChallenges.map(challenge => (
                            <div key={challenge._id} className="glass-card" style={{ padding: '1rem' }}>
                                <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                                    <Image
                                        src={challenge.image}
                                        alt={challenge.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        background: challenge.status === 'active' ? '#10b981' : challenge.status === 'upcoming' ? '#f59e0b' : '#6b7280',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                    }}>
                                        {challenge.status}
                                    </span>
                                </div>

                                <h4 style={{ marginBottom: '0.5rem' }}>{challenge.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                                    {challenge.description.substring(0, 100)}...
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '4px' }}>
                                        {challenge.category}
                                    </span>
                                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '4px' }}>
                                        {challenge.difficulty}
                                    </span>
                                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '4px' }}>
                                        👥 {challenge.participants}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => router.push(`/challenges/${challenge._id}`)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            border: '1px solid rgba(99, 102, 241, 0.3)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => router.push(`/admin/challenges/edit/${challenge._id}`)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(challenge._id)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
