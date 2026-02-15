"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PushToggle from '@/components/PushToggle';
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

    const navItems: { name: string; path: string; icon: React.ReactNode }[] = [
        {
            name: 'Home',
            path: '/dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            name: 'Feed',
            path: '/feed',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
            )
        },
        {
            name: 'Challenges',
            path: '/challenges',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
            )
        },
        {
            name: 'Leaderboards',
            path: '/leaderboards',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                </svg>
            )
        },
        {
            name: 'Winners',
            path: '/winners',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                    <path d="M7 4h10" />
                    <path d="M9 4v13" />
                    <path d="M15 4v13" />
                </svg>
            )
        },
    ];

    if (session) {
        navItems.splice(3, 0, {
            name: 'My Challenges',
            path: '/my-challenges',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                </svg>
            )
        });
        navItems.splice(3, 0, {
            name: 'Create Challenge',
            path: '/challenges/create',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            )
        });
        navItems.splice(2, 0, {
            name: 'Favorites',
            path: '/favorites',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            )
        });
        navItems.push({
            name: 'Profile',
            path: '/profile',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        });
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
                        width: '150px',
                        height: '150px',
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
                                    <PushToggle />
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
