'use client';

import { useState } from 'react';
import { useStudyStore } from '@/lib/store';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '@/lib/types';

export default function SyllabusPage() {
  const {
    subjects,
    chapters,
    addSubject,
    updateSubject,
    addChapter,
    toggleChapterComplete,
    getSubjectProgress,
  } = useStudyStore();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newChName, setNewChName] = useState('');

  const [fName, setFName] = useState('');
  const [fColor, setFColor] = useState(SUBJECT_COLORS[0]);
  const [fIcon, setFIcon] = useState(SUBJECT_ICONS[0].key);
  const [fDate, setFDate] = useState('');

  const resetModal = () => {
    setFName('');
    setFColor(SUBJECT_COLORS[0]);
    setFIcon(SUBJECT_ICONS[0].key);
    setFDate('');
    setEditId(null);
  };

  const handleSaveSubject = async () => {
    if (!fName.trim()) return;
    if (editId) {
      await updateSubject(editId, { name: fName.trim(), color: fColor, icon: fIcon, examDate: fDate || null });
    } else {
      const s = await addSubject(fName.trim(), fColor, fIcon, fDate || null);
      if (s?.id) setExpanded(s.id);
    }
    resetModal();
    setShowModal(false);
  };

  const handleOpenEdit = (id: string) => {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    setFName(s.name);
    setFColor(s.color);
    setFIcon(s.icon);
    setFDate(s.examDate || '');
    setEditId(id);
    setShowModal(true);
  };

  const handleAddChapter = async (sid: string) => {
    if (!newChName.trim()) return;
    await addChapter(sid, newChName.trim());
    setNewChName('');
    setAddingTo(null);
  };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Syllabus Manager</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Organize your subjects and track chapter progress.</p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => { resetModal(); setShowModal(true); }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>add</span>
          New Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', borderStyle: 'dashed' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--color-text-muted)', marginBottom: 16 }}>library_books</span>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>No Subjects Yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>Get started by adding your first subject to track.</p>
          <button className="btn-ghost" onClick={() => { resetModal(); setShowModal(true); }}>
            Add Subject
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {subjects.map((subject) => {
            const progress = getSubjectProgress(subject.id);
            const isExpanded = expanded === subject.id;
            const subjectChapters = chapters.filter((c) => c.subjectId === subject.id).sort((a, b) => a.sortOrder - b.sortOrder);

            return (
              <div key={subject.id} className="glass-card" style={{ overflow: 'hidden' }}>
                <div
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                  onClick={() => setExpanded(isExpanded ? null : subject.id)}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: `${subject.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: subject.color
                  }}>
                    <span className="material-symbols-rounded">{subject.icon}</span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>{subject.name}</h3>
                      {subject.examDate && (
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 100, background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}>
                          Exam: {new Date(subject.examDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--color-bg-highlight)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: subject.color, width: `${progress.percentage}%`, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, width: 40, textAlign: 'right' }}>
                        {progress.percentage}%
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-ghost"
                    style={{ padding: 8, minWidth: 'auto', display: 'flex' }}
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(subject.id); }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <span className="material-symbols-rounded" style={{ color: 'var(--color-text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    expand_more
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid var(--color-border-subtle)', marginTop: 8, paddingTop: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {subjectChapters.map((ch) => {
                        const isCompleted = ch.status === 'completed';
                        return (
                          <div key={ch.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            background: 'var(--color-bg-surface)', borderRadius: 10,
                            borderLeft: `3px solid ${isCompleted ? '#10B981' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                          }}>
                            <button
                              onClick={() => toggleChapterComplete(ch.id)}
                              style={{
                                width: 22, height: 22, borderRadius: 6, border: `2px solid ${isCompleted ? '#10B981' : 'var(--color-border-light)'}`,
                                background: isCompleted ? '#10B981' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isCompleted && <span className="material-symbols-rounded" style={{ fontSize: 14, color: 'white' }}>check</span>}
                            </button>
                            <span style={{
                              flex: 1, fontSize: 15, color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                              textDecoration: isCompleted ? 'line-through' : 'none', transition: 'all 0.2s ease'
                            }}>
                              {ch.name}
                            </span>
                          </div>
                        );
                      })}

                      {addingTo === subject.id ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Chapter name..."
                            value={newChName}
                            onChange={(e) => setNewChName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddChapter(subject.id)}
                            autoFocus
                          />
                          <button className="btn-primary" onClick={() => handleAddChapter(subject.id)}>Add</button>
                          <button className="btn-ghost" onClick={() => { setAddingTo(null); setNewChName(''); }}>Cancel</button>
                        </div>
                      ) : (
                        <button
                          className="btn-ghost"
                          style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderStyle: 'dashed' }}
                          onClick={() => setAddingTo(subject.id)}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>
                          Add Chapter
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{editId ? 'Edit Subject' : 'New Subject'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Subject Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Physics, Math..."
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Color Theme</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFColor(color)}
                      style={{
                        width: 32, height: 32, borderRadius: 16, background: color,
                        border: fColor === color ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                  {SUBJECT_ICONS.map((icon) => (
                    <button
                      key={icon.key}
                      onClick={() => setFIcon(icon.key)}
                      style={{
                        height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: fIcon === icon.key ? 'rgba(139, 92, 246, 0.2)' : 'var(--color-bg-hover)',
                        border: `1px solid ${fIcon === icon.key ? 'var(--color-accent)' : 'transparent'}`,
                        color: fIcon === icon.key ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      title={icon.label}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 20 }}>{icon.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Exam Date (Optional)</label>
                <input
                  type="date"
                  className="input-field"
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveSubject}>Save Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
