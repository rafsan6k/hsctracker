'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useStudyStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const initForUser = useStudyStore((s) => s.initForUser);
  const initialized = useStudyStore((s) => s.initialized);
  const reset = useStudyStore((s) => s.reset);

  const isLoginPage = pathname === '/login';

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, isLoginPage, router]);

  // Redirect authenticated users away from login
  useEffect(() => {
    if (!loading && user && isLoginPage) {
      router.push('/');
    }
  }, [user, loading, isLoginPage, router]);

  // Load user data from Supabase when authenticated
  useEffect(() => {
    if (user && !initialized) {
      initForUser(user.id);
    }
    if (!user && initialized) {
      reset();
    }
  }, [user, initialized, initForUser, reset]);

  // Login page — no sidebar, full width
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0d15',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, #d0bcff, #a078ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 12,
          }}>
            StudyFlow
          </h1>
          <p style={{ color: '#958ea0', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated layout with sidebar
  return (
    <>
      <Sidebar />
      <main className="main-content" style={{
        marginLeft: 260,
        flex: 1,
        minHeight: '100vh',
        padding: '32px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </>
  );
}
