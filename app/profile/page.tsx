'use client';

import { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store';

const BADGE_INFO: Record<string, { name: string; icon: string; desc: string }> = {
  first_step: { name: 'First Step', icon: '🎯', desc: 'Marked your first chapter complete' },
  week_warrior: { name: 'Week Warrior', icon: '⚔️', desc: '7-day study streak' },
  subject_slayer: { name: 'Subject Slayer', icon: '📚', desc: 'Completed 100% of a subject' },
  halfway_hero: { name: 'Halfway Hero', icon: '🏆', desc: 'Reached 50% overall completion' },
  ready_to_fly: { name: 'Ready to Fly', icon: '🚀', desc: '100% overall completion' },
  daily_grinder: { name: 'Daily Grinder', icon: '💎', desc: '30-day study streak' },
};

export default function ProfilePage() {
  const profile = useStudyStore((s) => s.profile);
  const updateProfile = useStudyStore((s) => s.updateProfile);
  const streak = useStudyStore((s) => s.streak);
  const badges = useStudyStore((s) => s.badges);
  const subjects = useStudyStore((s) => s.subjects);
  const chapters = useStudyStore((s) => s.chapters);
  const getOverallProgress = useStudyStore((s) => s.getOverallProgress);

  const [name, setName] = useState(profile.displayName);
  const [examLabel, setExamLabel] = useState(profile.examLabel);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { setName(profile.displayName); setExamLabel(profile.examLabel); }, [profile]);

  if (!mounted) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Loading...</div>;

  const overall = getOverallProgress();

  const saveName = async () => {
    if (name.trim()) await updateProfile({ displayName: name.trim() });
  };

  const saveLabel = async () => {
    await updateProfile({ examLabel: examLabel.trim() });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-up">
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Profile & Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>Personalize your StudyFlow experience.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card-static animate-fade-up" style={{ padding: 28, animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #8B5CF6, #a078ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: 'white',
          }}>
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.displayName}</div>
            {profile.examLabel && (
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.12)', color: '#d0bcff', fontWeight: 600 }}>{profile.examLabel}</span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <MiniStat label="Streak" value={`🔥 ${streak}`} />
          <MiniStat label="Subjects" value={subjects.length.toString()} />
          <MiniStat label="Chapters" value={chapters.length.toString()} />
          <MiniStat label="Done" value={`${overall.percentage}%`} />
        </div>
      </div>

      {/* Edit Profile */}
      <div className="glass-card-static animate-fade-up" style={{ padding: 24, animationDelay: '120ms' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} className="input-field" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Exam Label</label>
            <input value={examLabel} onChange={(e) => setExamLabel(e.target.value)} onBlur={saveLabel} placeholder="e.g., HSC 2026" className="input-field" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card-static animate-fade-up" style={{ padding: 24, animationDelay: '180ms' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Badges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {Object.entries(BADGE_INFO).map(([key, info]) => {
            const earned = badges.find((b) => b.key === key);
            return (
              <div key={key} style={{
                padding: 16, borderRadius: 12,
                background: earned ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${earned ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)'}`,
                opacity: earned ? 1 : 0.4,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{info.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{info.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{info.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data */}
      <div className="glass-card-static animate-fade-up" style={{ padding: 24, animationDelay: '240ms' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Data & Privacy</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Your data is securely synced to your cloud account. You can access it from any device by signing in.</p>
        <button className="btn-ghost" onClick={() => {
          const data = localStorage.getItem('studyflow-storage');
          if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'studyflow-backup.json'; a.click();
            URL.revokeObjectURL(url);
          }
        }} style={{ marginRight: 12 }}>
          Export Data
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}
