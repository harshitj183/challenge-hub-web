"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function CreateChallengePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Fitness',
        image: '',
        startDate: '',
        endDate: '',
        badge: 'Normal'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'image') {
            setPreviewImage(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create challenge');
            }

            // Redirect to the new challenge
            router.push(`/challenges/${data.challenge._id}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h1 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Create New Challenge</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Launch your own challenge and invite others to join!</p>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 500 }}>Challenge Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                minLength={5}
                                maxLength={100}
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., 30 Days of Code"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-light)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 500 }}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-light)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            >
                                <option value="Fitness" style={{ background: '#000' }}>Fitness</option>
                                <option value="Creative" style={{ background: '#000' }}>Creative</option>
                                <option value="Learning" style={{ background: '#000' }}>Learning</option>
                                <option value="Lifestyle" style={{ background: '#000' }}>Lifestyle</option>
                                <option value="Other" style={{ background: '#000' }}>Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 500 }}>Description</label>
                        <textarea
                            name="description"
                            required
                            minLength={10}
                            maxLength={1000}
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe what participants need to do..."
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-light)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Image URL */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 500 }}>Cover Image URL</label>
                        <input
                            type="url"
                            name="image"
                            required
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-light)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        {previewImage && (
                            <div style={{ marginTop: '0.5rem', position: 'relative', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <Image src={previewImage} alt="Preview" fill style={{ objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 500 }}>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-light)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 500 }}>End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                required
                                value={formData.endDate}
                                onChange={handleChange}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-light)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-secondary)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Creating...' : 'Create Challenge'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
