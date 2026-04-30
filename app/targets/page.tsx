'use client';

import { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store';
import type { TargetType } from '@/lib/types';

export default function TargetsPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const chapters = useStudyStore((s) => s.chapters);
  const targets = useStudyStore((s) => s.targets);
  const addTarget = useStudyStore((s) => s.addTarget);
  const deleteTarget = useStudyStore((s) => s.deleteTarget);
  const getTargetProgress = useStudyStore((s) => s.getTargetProgress);

  const [showModal, setShowModal] = useState(false);
  const [tType, setTType] = useState<TargetType>('daily');
  const [tValue, setTValue] = useState('5');
  const [tSubject, setTSubject] = useState<string>('');
  const [tLabel, setTLabel] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Loading...</div>;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getDateRange = (type: TargetType): { start: string; end: string } => {
    const s = new Date(today);
    const e = new Date(today);
    if (type === 'daily') {
      // today
    } else if (type === 'weekly') {
      const day = s.getDay();
      s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
      e.setDate(s.getDate() + 6);
    } else if (type === 'monthly') {
      s.setDate(1);
      e.setMonth(e.getMonth() + 1);
      e.setDate(0);
    } else {
      e.setDate(e.getDate() + 30);
    }
    return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
  };

  const handleAdd = async () => {
    const val = parseInt(tValue) || 5;
    if (val <= 0) return;
    const { start, end } = getDateRange(tType);
    await addTarget({
      type: tType,
      label: tLabel.trim() || `${tType.charAt(0).toUpperCase() + tType.slice(1)} Target`,
      targetValue: val,
      subjectId: tSubject || null,
      startDate: start,
      endDate: end,
    });
    setShowModal(false);
    setTValue('5');
    setTLabel('');
    setTSubject('');
  };

  // Separate active and past targets
  const active = targets.filter((t) => t.endDate >= todayStr);
  const past = targets.filter((t) => t.endDate < todayStr);

  // Suggested daily target
  const totalRemaining = chapters.filter((c) => c.status !== 'completed').length;
  const latestExam = subjects.filter((s) => s.examDate).sort((a, b) => (a.examDate! > b.examDate! ? 1 : -1))[0];
  let suggestedDaily = 0;
  let daysUntilExam = 0;
  if (latestExam?.examDate) {
    daysUntilExam = Math.max(1, Math.ceil((new Date(latestExam.examDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    suggestedDaily = Math.ceil(totalRemaining / daysUntilExam);
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    on_track: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
    at_risk: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
    missed: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
    completed: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  };

  const typeIcons: Record<string, string> = {
    daily: 'today', weekly: 'date_range', monthly: 'calendar_month', subject: 'school', exam: 'event',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Targets</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>Set goals and stay accountable.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>Set Target
        </button>
      </div>

      {/* Smart Suggestion */}
      {suggestedDaily > 0 && !targets.some((t) => t.type === 'daily') && (
        <div className="glass-card-static animate-fade-up" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(139,92,246,0.2)', animationDelay: '60ms' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#a078ff' }}>auto_awesome</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#d0bcff', marginBottom: 2 }}>Suggested Daily Target</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Complete <strong>{suggestedDaily}</strong> chapters/day to finish before your exam ({daysUntilExam} days left).</div>
          </div>
          <button className="btn-primary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={async () => {
            const { start, end } = getDateRange('daily');
            await addTarget({ type: 'daily', label: 'Daily Target', targetValue: suggestedDaily, subjectId: null, startDate: start, endDate: end });
          }}>Accept</button>
        </div>
      )}

      {/* Active Targets */}
      {active.length === 0 && past.length === 0 ? (
        <div className="glass-card-static animate-fade-up" style={{ padding: 48, textAlign: 'center', animationDelay: '120ms' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'var(--color-text-muted)', display: 'block', marginBottom: 16 }}>track_changes</span>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No active targets</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>Set a goal to stay on track.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Set Target</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#8B5CF6' }}>radar</span>Active Targets
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map((t, i) => {
                  const prog = getTargetProgress(t);
                  const sc = statusColors[prog.status] || statusColors.on_track;
                  const sub = t.subjectId ? subjects.find((s) => s.id === t.subjectId) : null;
                  const daysLeft = Math.max(0, Math.ceil((new Date(t.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={t.id} className="glass-card animate-fade-up" style={{ padding: '18px 20px', animationDelay: `${i * 60}ms` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#a078ff' }}>{typeIcons[t.type] || 'flag'}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                            <span>{t.type}</span>
                            {sub && <span style={{ color: sub.color }}>· {sub.name}</span>}
                            <span>· {daysLeft}d left</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>{prog.status.replace('_', ' ')}</span>
                        <button onClick={() => deleteTarget(t.id)} style={{ padding: 4, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                          <div className="progress-bar-fill" style={{ height: '100%', borderRadius: 3, background: prog.status === 'completed' ? 'linear-gradient(90deg,#10B981,#00E5C3)' : 'linear-gradient(90deg,#8B5CF6,#a078ff)', width: `${prog.percentage}%` }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: 'right' }}>{prog.done}/{prog.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', padding: '8px 0' }}>Past Targets ({past.length})</summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {past.map((t) => {
                  const prog = getTargetProgress(t);
                  const sc = statusColors[prog.status] || statusColors.missed;
                  return (
                    <div key={t.id} className="glass-card-static" style={{ padding: '14px 20px', opacity: 0.6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'var(--color-text-muted)' }}>{typeIcons[t.type]}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: sc.bg, color: sc.text }}>{prog.done}/{prog.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </>
      )}

      {/* Add Target Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Set Target</h2>

            {/* Type Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {(['daily', 'weekly', 'monthly', 'subject'] as TargetType[]).map((t) => (
                <button key={t} onClick={() => setTType(t)} style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid', fontFamily: 'var(--font-sans)',
                  background: tType === t ? 'rgba(139,92,246,0.15)' : 'transparent',
                  borderColor: tType === t ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)',
                  color: tType === t ? '#d0bcff' : 'var(--color-text-muted)',
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Label (optional)</label>
              <input value={tLabel} onChange={(e) => setTLabel(e.target.value)} placeholder="e.g., Physics Sprint" className="input-field" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Chapters to complete</label>
              <input type="number" value={tValue} onChange={(e) => setTValue(e.target.value)} className="input-field" min="1" max="100" />
            </div>

            {tType === 'subject' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Subject</label>
                <select value={tSubject} onChange={(e) => setTSubject(e.target.value)} className="input-field">
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd}>Set Target</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
