'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useStudyStore } from '@/lib/store';
import { useAuth } from './AuthProvider';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/syllabus', icon: 'auto_stories', label: 'Syllabus' },
  { href: '/mark', icon: 'checklist_rtl', label: 'Mark' },
  { href: '/targets', icon: 'track_changes', label: 'Targets' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const profile = useStudyStore((s) => s.profile);
  const streak = useStudyStore((s) => s.streak);
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 260,
        background: 'var(--color-panel-bg)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-panel-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 8px', marginBottom: 8 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #d0bcff, #a078ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            StudyFlow
          </h1>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            {profile.examLabel || 'Smart Study Tracker'}
          </p>
        </div>

        {/* Streak Badge */}
        {streak > 0 && (
          <div style={{
            margin: '16px 8px',
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#d0bcff' }}>{streak} day streak</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Keep it going!</div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16, flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="material-symbols-rounded">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Profile & Logout */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ThemeToggle className="sidebar-theme-toggle" />
          <Link href="/profile" className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #a078ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: 'white',
            }}>
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <span>{profile.displayName}</span>
          </Link>
          <button 
            onClick={() => signOut()}
            className="nav-link" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              width: '100%', 
              textAlign: 'left',
              color: '#ef4444' 
            }}
          >
            <span className="material-symbols-rounded">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="mobile-nav">
        <button
          type="button"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span className="material-symbols-rounded">menu</span>
          Menu
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobile}
      >
        <div
          className={`mobile-menu ${mobileOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Menu</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{profile.displayName}</div>
            </div>
            <button
              type="button"
              className="mobile-menu-close"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          <div className="mobile-menu-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <span className="material-symbols-rounded">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <Link
              href="/profile"
              className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <span className="material-symbols-rounded">person</span>
              Profile
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <ThemeToggle className="sidebar-theme-toggle" />
            <button 
              onClick={() => { signOut(); closeMobile(); }}
              className="nav-link" 
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                width: '100%', 
                textAlign: 'left',
                color: '#ef4444' 
              }}
            >
              <span className="material-symbols-rounded">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
