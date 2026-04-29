'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
      const { error: err } = await signUp(email, password, name.trim());
      if (err) { setError(err); setLoading(false); return; }
      setSuccess('Account created! Check your email to confirm, then sign in.');
      setIsSignUp(false);
    } else {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); setLoading(false); return; }
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0d15',
      padding: 24,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #d0bcff, #a078ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            StudyFlow
          </h1>
          <p style={{ color: '#958ea0', fontSize: 15 }}>
            Know exactly how prepared you are.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(29, 26, 35, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: 32,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#958ea0', fontSize: 13, marginBottom: 24 }}>
            {isSignUp ? 'Start tracking your study progress today.' : 'Sign in to continue your journey.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isSignUp && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6578', display: 'block', marginBottom: 6 }}>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field" autoComplete="name" />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6578', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" required autoComplete="email" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6578', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field" required minLength={6} autoComplete={isSignUp ? 'new-password' : 'current-password'} />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444', fontSize: 13, fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                color: '#10B981', fontSize: 13, fontWeight: 500,
              }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{
              width: '100%', padding: '12px 20px', fontSize: 15,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: 20, textAlign: 'center', fontSize: 13, color: '#958ea0',
          }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }} style={{
              background: 'none', border: 'none', color: '#d0bcff', cursor: 'pointer',
              fontWeight: 600, fontFamily: 'inherit', fontSize: 13,
            }}>
              {isSignUp ? 'Sign In' : 'Create one'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#6b6578' }}>
          Your data is safe and private. We never share your information.
        </p>
      </div>
    </div>
  );
}
