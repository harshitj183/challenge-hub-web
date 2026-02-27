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
    const [previewMedia, setPreviewMedia] = useState('');
    const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Fitness',
        challengeType: '1v1', // 1v1, group, tournament
        teamSize: 2,
        divisions: 2, // 2, 4, 6
        scoringType: 'best_of_3', // best_of_3, best_of_5, best_of_7, points
        hasTimer: false,
        timerDurationMinutes: 5,
        startDate: '',
        endDate: '',
        deadlineTime: '',
        mediaUrl: '',
        mediaType: 'image',
        trailerUrl: '',
        prizeType: 'money',
        prizeDetails: '',
        locationType: 'online',
        locationDetails: '',
        entryFee: 0,
        restrictions: '',
        rulesText: '', // Will be split by newline into array
        sponsorshipRequested: false,
        sponsorRoi: 12, // Default 12%
        creatorRoi: 3,  // Default 3%
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'number' ? Number(value) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);

        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'mediaUrl' && formData.mediaType === 'image') {
            setPreviewMedia(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const finalData = {
            ...formData,
            isPrivate: activeTab === 'private',
            requiresSubscription: activeTab === 'private',
            rules: formData.rulesText.split('\n').filter(r => r.trim() !== ''),
            tournamentDetails: formData.challengeType === 'tournament' ? { divisions: formData.divisions } : undefined,
            sponsorship: formData.sponsorshipRequested ? {
                roiPercentage: formData.sponsorRoi,
                creatorPercentage: formData.creatorRoi,
                status: 'pending'
            } : undefined
        };

        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create challenge');
            }

            router.push(`/challenges/${data.challenge._id}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '0.75rem',
        borderRadius: '8px',
        color: 'white',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s',
    };

    const estimatedJackpot = formData.entryFee > 0 ? (formData.entryFee * 0.85).toFixed(2) : 0;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '16px', background: 'rgba(20, 20, 20, 0.7)' }}>
                <h1 className="text-gradient" style={{ marginBottom: '0.5rem', fontSize: '2.2rem' }}>Create New Challenge</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Host 1v1s, Tournaments, or Group events and manage prize pools with ease.</p>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

                {/* TABS */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('public')}
                        style={{
                            flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                            background: activeTab === 'public' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                            color: activeTab === 'public' ? 'black' : 'var(--text-secondary)', transition: 'all 0.2s'
                        }}
                    >
                        🌎 Public Challenge
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('private')}
                        style={{
                            flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                            background: activeTab === 'private' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                            color: activeTab === 'private' ? 'black' : 'var(--text-secondary)', transition: 'all 0.2s'
                        }}
                    >
                        🔒 Private / Exclusive
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Basic Info Section */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', margin: 0 }}>Step 1: Challenge Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Title</label>
                                <input type="text" name="title" required minLength={5} maxLength={100} value={formData.title} onChange={handleChange} placeholder="The Ultimate Showdown..." style={inputStyles} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} style={inputStyles}>
                                    <option value="Fitness" style={{ background: '#000' }}>Fitness</option>
                                    <option value="Creative" style={{ background: '#000' }}>Creative</option>
                                    <option value="Gaming" style={{ background: '#000' }}>Gaming</option>
                                    <option value="Learning" style={{ background: '#000' }}>Learning</option>
                                    <option value="Other" style={{ background: '#000' }}>Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
                            <textarea name="description" required minLength={10} maxLength={1000} value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the goal of this challenge..." style={{ ...inputStyles, resize: 'vertical' }} />
                        </div>
                    </section>

                    {/* Competition Format */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', margin: 0, color: '#f59e0b' }}>Step 2: Competition Format</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Event Type</label>
                                <select name="challengeType" value={formData.challengeType} onChange={handleChange} style={inputStyles}>
                                    <option value="1v1" style={{ background: '#000' }}>1 vs 1 Battle</option>
                                    <option value="group" style={{ background: '#000' }}>Group Event</option>
                                    <option value="tournament" style={{ background: '#000' }}>Tournament Bracket (Max 50)</option>
                                </select>
                            </div>

                            {formData.challengeType === 'group' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Max Team Size</label>
                                    <input type="number" name="teamSize" min={2} max={10} value={formData.teamSize} onChange={handleChange} style={inputStyles} />
                                </div>
                            )}

                            {formData.challengeType === 'tournament' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bracket Divisions</label>
                                    <select name="divisions" value={formData.divisions} onChange={handleChange} style={inputStyles}>
                                        <option value={2} style={{ background: '#000' }}>2 Divisions</option>
                                        <option value={4} style={{ background: '#000' }}>4 Divisions</option>
                                        <option value={6} style={{ background: '#000' }}>6 Divisions</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Scoring System</label>
                                <select name="scoringType" value={formData.scoringType} onChange={handleChange} style={inputStyles}>
                                    <option value="best_of_3" style={{ background: '#000' }}>Best of 3</option>
                                    <option value="best_of_5" style={{ background: '#000' }}>Best of 5</option>
                                    <option value="best_of_7" style={{ background: '#000' }}>Best of 7</option>
                                    <option value="points" style={{ background: '#000' }}>Points Based</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <input type="checkbox" name="hasTimer" id="hasTimer" checked={formData.hasTimer} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: '#f59e0b' }} />
                                <label htmlFor="hasTimer" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Add Time Limit</label>
                            </div>

                            {formData.hasTimer && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Duration (Minutes)</label>
                                    <input type="number" name="timerDurationMinutes" min={1} value={formData.timerDurationMinutes} onChange={handleChange} style={inputStyles} />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Prizes & Location */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', margin: 0 }}>Step 3: Prizes & Logistics</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Prize Type</label>
                                <select name="prizeType" value={formData.prizeType} onChange={handleChange} style={inputStyles}>
                                    <option value="money" style={{ background: '#000' }}>Cash Jackpot</option>
                                    <option value="digital" style={{ background: '#000' }}>Digital Prize / Coins</option>
                                    <option value="physical" style={{ background: '#000' }}>Physical Product (Appr. Req)</option>
                                    <option value="NONE" style={{ background: '#000' }}>Bragging Rights Only</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Prize Description</label>
                                <input type="text" name="prizeDetails" value={formData.prizeDetails} onChange={handleChange} placeholder={formData.prizeType === 'money' ? 'e.g., $1000 Cash' : 'e.g., PS5 Console'} style={{ ...inputStyles, opacity: formData.prizeType === 'NONE' ? 0.5 : 1 }} disabled={formData.prizeType === 'NONE'} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Entry Fee ($)</label>
                                <input type="number" name="entryFee" min={0} value={formData.entryFee} onChange={handleChange} style={inputStyles} placeholder="0 = Free" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', color: '#10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Projected Setup Jackpot: </span>
                                    <strong style={{ fontSize: '1.2rem' }}>${estimatedJackpot}</strong>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.8, alignSelf: 'flex-end', marginLeft: '5px' }}>(85% payout)</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Location Format</label>
                                <select name="locationType" value={formData.locationType} onChange={handleChange} style={inputStyles}>
                                    <option value="online" style={{ background: '#000' }}>Virtual / Online</option>
                                    <option value="in-person" style={{ background: '#000' }}>In-Person Event</option>
                                </select>
                            </div>

                            {formData.locationType === 'in-person' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Event Mapping Address</label>
                                    <input type="text" name="locationDetails" value={formData.locationDetails} onChange={handleChange} placeholder="Physical address will link to local Events..." style={inputStyles} />
                                </div>
                            )}
                        </div>

                        {/* Sponsorship Collaboration */}
                        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: formData.sponsorshipRequested ? '1rem' : '0' }}>
                                <input type="checkbox" name="sponsorshipRequested" id="sponsorshipRequested" checked={formData.sponsorshipRequested} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }} />
                                <div>
                                    <label htmlFor="sponsorshipRequested" style={{ fontWeight: 600, fontSize: '1rem', color: '#60a5fa' }}>Enable Sponsorship Collaboration</label>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allow a sponsor to fund the prize money and negotiate an ROI split.</p>
                                </div>
                            </div>

                            {formData.sponsorshipRequested && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sponsor Return (%)</label>
                                        <input type="number" name="sponsorRoi" min={0} max={100} value={formData.sponsorRoi} onChange={handleChange} style={inputStyles} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Creator Return (%)</label>
                                        <input type="number" name="creatorRoi" min={0} max={100} value={formData.creatorRoi} onChange={handleChange} style={inputStyles} />
                                    </div>
                                    <span style={{ gridColumn: '1 / -1', fontSize: '0.75rem', color: '#9ca3af' }}>Both parties must approve the equity sync before final execution.</span>
                                </div>
                            )}
                        </div>

                    </section>

                    {/* Media, Dates & Rules */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', margin: 0 }}>Step 4: Scheduling & Rules</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Registration Deadline</label>
                                <input type="datetime-local" name="deadlineTime" required value={formData.deadlineTime} onChange={handleChange} style={{ ...inputStyles, colorScheme: 'dark' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Challenge Start</label>
                                <input type="datetime-local" name="startDate" required value={formData.startDate} onChange={handleChange} style={{ ...inputStyles, colorScheme: 'dark' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Challenge End</label>
                                <input type="datetime-local" name="endDate" required value={formData.endDate} onChange={handleChange} style={{ ...inputStyles, colorScheme: 'dark' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Promo Image / Flyer URL</label>
                                <input type="url" name="mediaUrl" value={formData.mediaUrl} onChange={handleChange} placeholder="Image link..." style={inputStyles} />
                                {previewMedia && (
                                    <div style={{ marginTop: '0.5rem', position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                        <Image src={previewMedia} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Promo Trailer Video URL</label>
                                <input type="url" name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} placeholder="YouTube/Vimeo link..." style={inputStyles} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Standard Rules & Policies (One per line)</label>
                            <textarea name="rulesText" value={formData.rulesText} onChange={handleChange} rows={4} placeholder="e.g. Standard platform rules apply.&#10;No toxic behavior allowed.&#10;Late submissions will be disqualified." style={{ ...inputStyles, resize: 'vertical' }} />
                        </div>

                        {activeTab === 'private' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <label style={{ fontWeight: 500, color: 'var(--accent-primary)' }}>Private Restrictions</label>
                                <input type="text" name="restrictions" value={formData.restrictions} onChange={handleChange} placeholder="e.g., Minimum 18 years old, verified users only" style={inputStyles} />
                            </div>
                        )}
                    </section>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={() => router.back()} style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#000',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}>
                            {loading ? 'Processing Event...' : 'Launch Challenge →'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
