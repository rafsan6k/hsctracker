'use client';

import { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store';

export default function MarkPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const chapters = useStudyStore((s) => s.chapters);
  const toggleChapterComplete = useStudyStore((s) => s.toggleChapterComplete);
  const getTodayCompletions = useStudyStore((s) => s.getTodayCompletions);
  const targets = useStudyStore((s) => s.targets);

  const [filterStatus, setFilterStatus] = useState<'all' | 'not_started' | 'completed'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Loading...</div>;

  const today = new Date().toISOString().split('T')[0];
  const dailyTarget = targets.find((t) => t.type === 'daily' && t.startDate <= today && t.endDate >= today);
  const dailyVal = dailyTarget?.targetValue || 5;
  const todayCount = getTodayCompletions();

  const filtered = chapters
    .filter((ch) => {
      if (filterStatus === 'not_started') return ch.status !== 'completed';
      if (filterStatus === 'completed') return ch.status === 'completed';
      return true;
    })
    .filter((ch) => filterSubject === 'all' || ch.subjectId === filterSubject);

  // Group by subject
  const grouped = subjects
    .filter((s) => filtered.some((ch) => ch.subjectId === s.id))
    .map((s) => ({
      subject: s,
      chapters: filtered.filter((ch) => ch.subjectId === s.id).sort((a, b) => a.sortOrder - b.sortOrder),
    }));

  const handleToggle = (chId: string) => {
    const ch = chapters.find((c) => c.id === chId);
    if (!ch) return;
    const isCompleting = ch.status !== 'completed';

    toggleChapterComplete(chId);

    if (isCompleting) {
      const newCount = todayCount + 1;
      if (newCount >= dailyVal) {
        setToast('🎯 Daily target hit! Great work!');
        setTimeout(() => setToast(null), 3000);
      }
      // Check if subject complete
      const subChs = chapters.filter((c) => c.subjectId === ch.subjectId);
      const subDone = subChs.filter((c) => c.status === 'completed' || c.id === chId).length;
      if (subDone === subChs.length && subChs.length > 0) {
        const sub = subjects.find((s) => s.id === ch.subjectId);
        setToast(`📚 ${sub?.name} complete! Amazing work!`);
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-fade-up">
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Mark Progress</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>Log your study sessions and track mastery.</p>
      </div>

      {/* Today Summary Bar */}
      <div className="glass-card-static animate-fade-up" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: '60ms' }}>
        <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#8B5CF6' }}>today</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>Today&apos;s Progress</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{todayCount} <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>/ {dailyVal} chapters</span></div>
        </div>
        <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: todayCount >= dailyVal ? 'linear-gradient(90deg,#10B981,#00E5C3)' : 'linear-gradient(90deg,#8B5CF6,#a078ff)', width: `${Math.min((todayCount / dailyVal) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-up" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animationDelay: '120ms' }}>
        {(['all', 'not_started', 'completed'] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
            background: filterStatus === s ? 'rgba(139,92,246,0.15)' : 'transparent',
            borderColor: filterStatus === s ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)',
            color: filterStatus === s ? '#d0bcff' : 'var(--color-text-muted)',
          }}>
            {s === 'all' ? 'All' : s === 'not_started' ? 'Pending' : 'Completed'}
          </button>
        ))}
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="input-field" style={{ padding: '7px 14px', fontSize: 13, width: 'auto', minWidth: 140 }}>
          <option value="all">All Subjects</option>
          {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
        </select>
      </div>

      {/* Chapter List */}
      {grouped.length === 0 ? (
        <div className="glass-card-static" style={{ padding: 48, textAlign: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--color-text-muted)', display: 'block', marginBottom: 12 }}>checklist</span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            {chapters.length === 0 ? 'Nothing to mark yet. Add chapters to your syllabus first.' : 'No chapters match your filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {grouped.map(({ subject: sub, chapters: chs }) => (
            <div key={sub.id} className="animate-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18, color: sub.color }}>{sub.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: sub.color }}>{sub.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>({chs.filter((c) => c.status === 'completed').length}/{chs.length})</span>
              </div>
              <div className="glass-card-static" style={{ overflow: 'hidden' }}>
                {chs.map((ch, i) => (
                  <div key={ch.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderBottom: i < chs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                    opacity: ch.status === 'completed' ? 0.6 : 1,
                  }} onClick={() => handleToggle(ch.id)}>
                    {/* Checkbox */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, border: `2px solid ${ch.status === 'completed' ? '#10B981' : 'rgba(255,255,255,0.12)'}`,
                      background: ch.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                    }}>
                      {ch.status === 'completed' && (
                        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7l4 4 6-8" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="check-mark" style={{ strokeDasharray: 24, strokeDashoffset: 0 }} /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, textDecoration: ch.status === 'completed' ? 'line-through' : 'none', color: ch.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>{ch.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Chapter {ch.chapterNumber}</div>
                    </div>
                    {ch.completedAt && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {new Date(ch.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
