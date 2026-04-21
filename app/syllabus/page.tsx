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
  const [delConfirm, setDelConfirm] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  const [fName, setFName] = useState('');
  const [fColor, setFColor] = useState(SUBJECT_COLORS[0]);
  const [fIcon, setFIcon] = useState(SUBJECT_ICONS[0].key);
  const [fDate, setFDate] = useState('');

  const reset = () => {
    setFName('');
    setFColor(SUBJECT_COLORS[0]);
    setFIcon(SUBJECT_ICONS[0].key);
    setFDate('');
  };

  // ✅ FIXED SAFE SAVE FUNCTION
  const save = async () => {
    if (!fName.trim()) return;

    if (editId) {
      updateSubject(editId, {
        name: fName.trim(),
        color: fColor,
        icon: fIcon,
        examDate: fDate || null,
      });

      setEditId(null);
    } else {
      const s = await addSubject(
        fName.trim(),
        fColor,
        fIcon,
        fDate || null
      );

      // ✅ SAFE: only set if id exists
      if (s?.id) {
        setExpanded(s.id);
      }
    }

    reset();
    setShowModal(false);
  };

  const openEdit = (id: string) => {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;

    setFName(s.name);
    setFColor(s.color);
    setFIcon(s.icon);
    setFDate(s.examDate || '');

    setEditId(id);
    setShowModal(true);
  };

  const addCh = (sid: string) => {
    if (!newChName.trim()) return;
    addChapter(sid, newChName.trim());
    setNewChName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER */}
      <div
        className="animate-fade-up"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Syllabus</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Manage subjects and track chapter completion.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            reset();
            setEditId(null);
            setShowModal(true);
          }}
        >
          Add Subject
        </button>
      </div>

      {/* EMPTY STATE */}
      {subjects.length === 0 ? (
        <div className="glass-card-static" style={{ padding: 64, textAlign: 'center' }}>
          <h3>No subjects yet</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subjects.map((sub, idx) => {
            const prog = getSubjectProgress(sub.id);
            const chs = getSubjectChapters(sub.id);
            const isExp = expanded === sub.id;

            return (
              <div key={sub.id} className="glass-card-static">
                {/* SUBJECT HEADER */}
                <div
                  onClick={() => setExpanded(isExp ? null : sub.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: sub.color,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{sub.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {prog.completed}/{prog.total} · {prog.percentage}%
                    </div>
                  </div>
                </div>

                {/* CHAPTERS */}
                {isExp && (
                  <div style={{ padding: 16 }}>
                    {chs.map((ch) => (
                      <div key={ch.id} style={{ display: 'flex', gap: 10 }}>
                        <span>{ch.chapterNumber}</span>
                        <span style={{ flex: 1 }}>{ch.name}</span>
                      </div>
                    ))}

                    <button
                      onClick={() => setAddingTo(sub.id)}
                      style={{ marginTop: 10 }}
                    >
                      Add Chapter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Subject' : 'Add Subject'}</h2>

            <input
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              placeholder="Subject name"
            />

            <button onClick={save}>
              {editId ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
