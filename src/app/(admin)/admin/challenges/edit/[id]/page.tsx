
"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '../../../page.module.css';

interface CreateEditDate {
    params: Promise<{ id: string }>;
}

export default function EditChallengePage(props: CreateEditDate) {
    const params = use(props.params);
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Creative',
        startDate: '',
        endDate: '',
        image: '',
        badge: 'Normal',
        prizeAmount: '',
        prizeDescription: '',
    });

    useEffect(() => {
        fetchChallenge();
    }, [params.id]);

    const fetchChallenge = async () => {
        try {
            const res = await fetch(`/api/challenges/${params.id}`);
            const data = await res.json();

            if (res.ok && data.challenge) {
                const c = data.challenge;
                setFormData({
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    startDate: new Date(c.startDate).toISOString().slice(0, 16),
                    endDate: new Date(c.endDate).toISOString().slice(0, 16),
                    image: c.image,
                    badge: c.badge,
                    prizeAmount: c.prize?.amount?.toString() || '',
                    prizeDescription: c.prize?.description || '',
                });
            } else {
                setError('Failed to load challenge details');
            }
        } catch (err) {
            setError('Error loading challenge');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                ...formData,
                prize: formData.badge === 'Prize' ? {
                    amount: Number(formData.prizeAmount),
                    description: formData.prizeDescription
                } : undefined
            };

            const res = await fetch(`/api/challenges/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin/challenges');
                router.refresh();
            } else {
                setError(data.error || 'Failed to update challenge');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <h1 className="text-gradient">Edit Challenge</h1>
                <button className="btn-secondary" onClick={() => router.back()}>Cancel</button>
            </header>

            <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        color: '#fca5a5'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.formGroup}>
                        <label>Challenge Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={5}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    {/* Same fields as Create... reused */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="Creative">Creative</option>
                                <option value="Fitness">Fitness</option>
                                <option value="Learning">Learning</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Badge Type</label>
                            <select
                                name="badge"
                                value={formData.badge}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="Normal">Normal</option>
                                <option value="Prize">Prize (Money/Reward)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className={styles.formGroup}>
                            <label>Start Date</label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>End Date</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Cover Image URL</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>

                    {formData.badge === 'Prize' && (
                        <div style={{ padding: '1rem', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.3)' }}>
                            <h4 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Prize Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <div>
                                    <label>Amount ($)</label>
                                    <input
                                        type="number"
                                        name="prizeAmount"
                                        value={formData.prizeAmount}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <div>
                                    <label>Prize Description</label>
                                    <input
                                        type="text"
                                        name="prizeDescription"
                                        value={formData.prizeDescription}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className={styles.btnSecondary}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary"
                            style={{ padding: '0.75rem 2rem', borderRadius: '8px', background: 'var(--gradient-main)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? 'Saving...' : 'Update Challenge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
