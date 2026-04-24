'use client';

import { useState } from 'react';
import { useStudyStore } from '@/lib/store';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '@/lib/types';

export default function SyllabusPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const addSubject = useStudyStore((s) => s.addSubject);
  const updateSubject = useStudyStore((s) => s.updateSubject);
  const deleteSubject = useStudyStore((s) => s.deleteSubject);
  const addChapter = useStudyStore((s) => s.addChapter);
  const deleteChapter = useStudyStore((s) => s.deleteChapter);
  const getSubjectProgress = useStudyStore((s) => s.getSubjectProgress);
  const getSubjectChapters = useStudyStore((s) => s.getSubjectChapters);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newChName, setNewChName] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [fName, setFName] = useState('');
  const [fColor, setFColor] = useState(SUBJECT_COLORS[0]);
  const [fIcon, setFIcon] = useState(SUBJECT_ICONS[0].key);
  const [fDate, setFDate] = useState('');

  const reset = () => { setFName(''); setFColor(SUBJECT_COLORS[0]); setFIcon(SUBJECT_ICONS[0].key); setFDate(''); };

  const save = () => {
    if (!fName.trim()) return;
    if (editId) {
      updateSubject(editId, { name: fName.trim(), color: fColor, icon: fIcon, examDate: fDate || null });
      setEditId(null);
    } else {
      const s = addSubject(fName.trim(), fColor, fIcon, fDate || null);
      setExpanded(s.id);
    }
    reset(); setShowModal(false);
  };

  const openEdit = (id: string) => {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    setFName(s.name); setFColor(s.color); setFIcon(s.icon); setFDate(s.examDate || '');
    setEditId(id); setShowModal(true);
  };

  const addCh = (sid: string) => {
    if (!newChName.trim()) return;
    addChapter(sid, newChName.trim());
    setNewChName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Syllabus</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>Manage subjects and track chapter completion.</p>
        </div>
        <button className="btn-primary" onClick={() => { reset(); setEditId(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card-static animate-fade-up" style={{ padding: 64, textAlign: 'center' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 56, color: 'var(--color-text-muted)', display: 'block', marginBottom: 16 }}>auto_stories</span>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No subjects yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>Add your first subject to start tracking.</p>
          <button className="btn-primary" onClick={() => { reset(); setShowModal(true); }}>Add Your First Subject</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subjects.map((sub, idx) => {
            const prog = getSubjectProgress(sub.id);
            const chs = getSubjectChapters(sub.id);
            const isExp = expanded === sub.id;
            return (
              <div key={sub.id} className="glass-card-static animate-fade-up" style={{ overflow: 'hidden', animationDelay: `${idx * 60}ms` }}>
                <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => setExpanded(isExp ? null : sub.id)}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${sub.color}18`, border: `1px solid ${sub.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: sub.color }}>{sub.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{sub.name}</span>
                      {sub.examDate && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontWeight: 600 }}>{new Date(sub.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{prog.completed}/{prog.total} chapters · {prog.percentage}%</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(sub.id)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>edit</span></button>
                    <button onClick={() => setDelConfirm({ type: 'subject', id: sub.id, name: sub.name })} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>delete</span></button>
                  </div>
                  <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : '' }}>expand_more</span>
                </div>
                <div style={{ padding: '0 20px 12px', marginTop: -4 }}>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ height: '100%', borderRadius: 2, background: sub.color, width: `${prog.percentage}%`, opacity: 0.7 }} />
                  </div>
                </div>
                {isExp && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '12px 20px 16px' }}>
                    {chs.map((ch) => (
                      <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', width: 24, textAlign: 'center' }}>{ch.chapterNumber}</span>
                        <span style={{ flex: 1, fontSize: 14, color: ch.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: ch.status === 'completed' ? 'line-through' : 'none' }}>{ch.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: ch.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', color: ch.status === 'completed' ? '#10B981' : 'var(--color-text-muted)' }}>{ch.status === 'completed' ? 'Done' : 'Pending'}</span>
                        <button onClick={() => setDelConfirm({ type: 'chapter', id: ch.id, name: ch.name })} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', opacity: 0.5 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span></button>
                      </div>
                    ))}
                    {addingTo === sub.id ? (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input autoFocus value={newChName} onChange={(e) => setNewChName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addCh(sub.id); if (e.key === 'Escape') { setAddingTo(null); setNewChName(''); } }} placeholder="Chapter name..." className="input-field" style={{ flex: 1, padding: '8px 12px', fontSize: 13 }} />
                        <button onClick={() => addCh(sub.id)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'rgba(139,92,246,0.15)', color: '#d0bcff', cursor: 'pointer' }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check</span></button>
                        <button onClick={() => { setAddingTo(null); setNewChName(''); }} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-muted)', cursor: 'pointer' }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span></button>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingTo(sub.id); setNewChName(''); }} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.08)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)', width: '100%' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>Add Chapter
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditId(null); reset(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{editId ? 'Edit Subject' : 'Add Subject'}</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Subject Name</label>
              <input autoFocus value={fName} onChange={(e) => setFName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder="e.g., Physics" className="input-field" maxLength={50} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUBJECT_COLORS.map((c) => (<button key={c} onClick={() => setFColor(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: fColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer', transform: fColor === c ? 'scale(1.1)' : '' }} />))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUBJECT_ICONS.map((ic) => (<button key={ic.key} onClick={() => setFIcon(ic.key)} title={ic.label} style={{ width: 40, height: 40, borderRadius: 10, background: fIcon === ic.key ? `${fColor}20` : 'rgba(255,255,255,0.04)', border: fIcon === ic.key ? `1px solid ${fColor}40` : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-rounded" style={{ fontSize: 20, color: fIcon === ic.key ? fColor : 'var(--color-text-muted)' }}>{ic.key}</span></button>))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Exam Date (optional)</label>
              <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="input-field" style={{ colorScheme: 'dark' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => { setShowModal(false); setEditId(null); reset(); }}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!fName.trim()}>{editId ? 'Save' : 'Add Subject'}</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <div className="modal-overlay" onClick={() => setDelConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#EF4444', display: 'block', marginBottom: 16 }}>warning</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete {delConfirm.type}?</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>This will permanently delete &quot;{delConfirm.name}&quot;{delConfirm.type === 'subject' ? ' and all its chapters' : ''}. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => { if (delConfirm.type === 'subject') deleteSubject(delConfirm.id); else deleteChapter(delConfirm.id); setDelConfirm(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
