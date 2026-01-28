"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        if (session) {
            fetchLatestUser();
        }
    }, [session]);

    const fetchLatestUser = async () => {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching latest user:', error);
        }
    };

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: '🏠' },
        { name: 'Feed', path: '/feed', icon: '🌟' },
        { name: 'Challenges', path: '/challenges', icon: '⚔️' },
        { name: 'Leaderboards', path: '/leaderboards', icon: '🏆' },
        { name: 'Winners', path: '/winners', icon: '👑' },
    ];

    if (session) {
        navItems.splice(3, 0, { name: 'My Challenges', path: '/my-challenges', icon: '🎯' });
        navItems.splice(2, 0, { name: 'Favorites', path: '/favorites', icon: '⭐' });
        navItems.push({ name: 'Profile', path: '/profile', icon: '👤' });
    }

    const closeMobileMenu = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${mobileOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Sidebar */}
            <aside className={`sidebar glass-card ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="logo-container" style={{
                        position: 'relative',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                        border: '2px solid rgba(255, 215, 0, 0.5)'
                    }}>
                        <Image
                            src="/logo-gold.jpg"
                            alt="Challenge Suite"
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            unoptimized
                            key="logo-gold-new"
                        />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {!isLoading && (
                        <>
                            {session ? (
                                <div className="user-section">
                                    <Link href="/subscriptions" className="premium-link" style={{ marginBottom: '1rem', display: 'block', textAlign: 'center' }} onClick={closeMobileMenu}>
                                        💎 Premium
                                    </Link>

                                    <div className="user-profile">
                                        <div className="user-avatar">
                                            <Image
                                                src={currentUser?.avatar || session.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || session.user?.name || 'User')}&background=6366f1&color=fff`}
                                                alt={currentUser?.name || session.user?.name || 'User'}
                                                width={40}
                                                height={40}
                                                unoptimized
                                                style={{ borderRadius: '50%' }}
                                            />
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">{currentUser?.name || session.user?.name || 'User'}</div>
                                            <button onClick={() => { signOut(); closeMobileMenu(); }} className="logout-btn">Sign Out</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <Link href="/auth/login" className="auth-btn login" onClick={closeMobileMenu}>
                                        Sign In
                                    </Link>
                                    <Link href="/auth/register" className="auth-btn register" onClick={closeMobileMenu}>
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}
