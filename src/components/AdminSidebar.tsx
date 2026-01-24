"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './AdminSidebar.css';

const navItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Challenges', path: '/admin/challenges', icon: '⚔️' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
    { name: 'Database', path: '/admin/database', icon: '🗄️' },
    { name: 'Winners', path: '/admin/winners', icon: '🏆' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="admin-sidebar glass-card">
            <div className="sidebar-header">
                <h2 className="text-gradient">Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="sidebar-footer">
                <Link href="/" className="back-link">
                    ← Back to App
                </Link>
            </div>
        </aside>
    );
}
