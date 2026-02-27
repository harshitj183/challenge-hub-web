"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'PhotoBox Challenge Suite',
        siteDescription: 'Compete, Create, and Win Amazing Prizes',
        contactEmail: 'admin@photobox.com',
        maxUploadSize: '10',
        allowRegistration: true,
        requireEmailVerification: false,
        enablePrizes: true,
        platformFeePercent: 15,
        platformRules: '1. Original content only.\n2. No NSFW content.\n3. Follow the theme.',
        requirePhysicalPrizeApproval: true,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    const handleSave = async () => {
        setLoading(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Settings saved successfully!');
        setLoading(false);
    };

    if (status === 'loading') {
        return (
            <div className={styles.adminDashboard}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminDashboard}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Platform configuration and preferences
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* General Settings */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>⚙️ General Settings</h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Site Name
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Site Description
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
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
                    </div>
                </div>

                {/* Upload Settings */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>📤 Upload Settings</h3>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Max Upload Size (MB)
                        </label>
                        <input
                            type="number"
                            value={settings.maxUploadSize}
                            onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                            style={{
                                width: '200px',
                                padding: '0.75rem 1rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                            }}
                        />
                    </div>
                </div>

                {/* User Settings */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>👥 User Settings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.allowRegistration}
                                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span>Allow New User Registration</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.requireEmailVerification}
                                onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span>Require Email Verification</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.enablePrizes}
                                onChange={(e) => setSettings({ ...settings, enablePrizes: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span>Enable Prize Challenges</span>
                        </label>
                    </div>
                </div>

                {/* Financial & Policy Settings */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>💰 Financial & Policy Rules</h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Platform Fee / Commission (%)
                            </label>
                            <input
                                type="number"
                                value={settings.platformFeePercent}
                                onChange={(e) => setSettings({ ...settings, platformFeePercent: Number(e.target.value) })}
                                style={{
                                    width: '200px',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                }}
                            />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                This determines the admin cut. (e.g., 15% admin fee, leaving 85% to the prize pool winner).
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Standard Platform Rules
                            </label>
                            <textarea
                                value={settings.platformRules}
                                onChange={(e) => setSettings({ ...settings, platformRules: e.target.value })}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                These rules will be shown globally on all challenges.
                            </p>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.requirePhysicalPrizeApproval}
                                onChange={(e) => setSettings({ ...settings, requirePhysicalPrizeApproval: e.target.checked })}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span>Require Admin Approval for Physical Product Prizes</span>
                        </label>
                    </div>
                </div>

                {/* Database Info */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>🗄️ Database Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Status
                            </p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
                                ✓ Connected
                            </p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Environment
                            </p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                Development
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
