'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStudyStore } from '@/lib/store';

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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 260,
        background: 'rgba(15, 13, 21, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
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

        {/* Profile */}
        <Link href="/profile" className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
              style={{ marginTop: 'auto' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #a078ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: 'white',
          }}>
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <span>{profile.displayName}</span>
        </Link>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link
          href="/profile"
          className={`mobile-nav-link ${pathname === '/profile' ? 'active' : ''}`}
        >
          <span className="material-symbols-rounded">person</span>
          Profile
        </Link>
      </nav>
    </>
  );
}
