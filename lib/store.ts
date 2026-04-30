'use client';

import { create } from 'zustand';
import { getSupabase } from './supabase';
import type { Subject, Chapter, Target, Badge, CompletionLog, UserProfile } from './types';

interface StudyStore {
  // ── Data ──
  subjects: Subject[];
  chapters: Chapter[];
  targets: Target[];
  badges: Badge[];
  completionLogs: CompletionLog[];
  profile: UserProfile;
  streak: number;
  lastActiveDate: string | null;
  userId: string | null;
  initialized: boolean;

  // ── Init ──
  initForUser: (userId: string) => Promise<void>;
  reset: () => void;

  // ── Subject Actions ──
  addSubject: (name: string, color: string, icon: string, examDate: string | null) => Promise<Subject | null>;
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // ── Chapter Actions ──
  addChapter: (subjectId: string, name: string) => Promise<Chapter | null>;
  updateChapter: (id: string, updates: Partial<Omit<Chapter, 'id'>>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  toggleChapterComplete: (id: string) => Promise<void>;

  // ── Target Actions ──
  addTarget: (target: Omit<Target, 'id' | 'createdAt'>) => Promise<void>;
  deleteTarget: (id: string) => Promise<void>;

  // ── Profile Actions ──
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // ── Computed ──
  getSubjectChapters: (subjectId: string) => Chapter[];
  getSubjectProgress: (subjectId: string) => { completed: number; total: number; percentage: number };
  getOverallProgress: () => { completed: number; total: number; percentage: number };
  getTodayCompletions: () => number;
  getWeeklyData: () => { day: string; count: number; date: string }[];
  getTargetProgress: (target: Target) => { done: number; total: number; percentage: number; status: string };
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
}

const defaultProfile: UserProfile = {
  displayName: 'Student',
  examLabel: '',
  dailyReminderTime: '20:00',
  theme: 'dark',
};

export const useStudyStore = create<StudyStore>()((set, get) => ({
  subjects: [],
  chapters: [],
  targets: [],
  badges: [],
  completionLogs: [],
  profile: { ...defaultProfile },
  streak: 0,
  lastActiveDate: null,
  userId: null,
  initialized: false,

  // ── Load all data for a user from Supabase ──
  initForUser: async (userId: string) => {
    try {
      const sb = getSupabase();

      const [subRes, chRes, tgRes, bgRes, logRes, profRes] = await Promise.all([
        sb.from('subjects').select('*').eq('user_id', userId).order('sort_order'),
        sb.from('chapters').select('*').eq('user_id', userId).order('sort_order'),
        sb.from('targets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        sb.from('badges').select('*').eq('user_id', userId),
        sb.from('completion_logs').select('*').eq('user_id', userId),
        sb.from('profiles').select('*').eq('id', userId).single(),
      ]);

      const mapSubject = (r: Record<string, unknown>): Subject => ({
        id: r.id as string, name: r.name as string, color: r.color as string, icon: r.icon as string,
        examDate: r.exam_date ? String(r.exam_date) : null,
        createdAt: r.created_at as string, sortOrder: (r.sort_order as number) || 0,
      });

      const mapChapter = (r: Record<string, unknown>): Chapter => ({
        id: r.id as string, subjectId: r.subject_id as string, name: r.name as string,
        chapterNumber: (r.chapter_number as number) || 1,
        status: (r.status as Chapter['status']) || 'not_started',
        completedAt: r.completed_at ? String(r.completed_at) : null,
        createdAt: r.created_at as string, sortOrder: (r.sort_order as number) || 0,
      });

      const mapTarget = (r: Record<string, unknown>): Target => ({
        id: r.id as string, type: r.type as Target['type'], label: r.label as string,
        targetValue: r.target_value as number, subjectId: r.subject_id ? String(r.subject_id) : null,
        startDate: r.start_date as string, endDate: r.end_date as string, createdAt: r.created_at as string,
      });

      const prof = profRes.data;

      set({
        userId,
        initialized: true,
        subjects: (subRes.data || []).map(mapSubject),
        chapters: (chRes.data || []).map(mapChapter),
        targets: (tgRes.data || []).map(mapTarget),
        badges: (bgRes.data || []).map((r: Record<string, unknown>) => ({ key: r.badge_key as Badge['key'], earnedAt: r.earned_at as string })),
        completionLogs: (logRes.data || []).map((r: Record<string, unknown>) => ({ chapterId: r.chapter_id as string, completedAt: r.completed_at as string })),
        profile: prof ? {
          displayName: (prof.display_name as string) || 'Student',
          examLabel: (prof.exam_label as string) || '',
          dailyReminderTime: '20:00',
          theme: 'dark',
        } : { ...defaultProfile },
        streak: prof ? ((prof.streak as number) || 0) : 0,
        lastActiveDate: prof?.last_active_date ? String(prof.last_active_date) : null,
      });
    } catch (error) {
      console.error('Failed to initialize store for user:', error);
      // Still set initialized to true to prevent perma-loading, but maybe show an error UI elsewhere
      set({ initialized: true });
    }
  },

  reset: () => {
    set({
      subjects: [], chapters: [], targets: [], badges: [], completionLogs: [],
      profile: { ...defaultProfile }, streak: 0, lastActiveDate: null, userId: null, initialized: false,
    });
  },

  // ── Subject Actions ──
  addSubject: async (name, color, icon, examDate) => {
    const { userId } = get();
    if (!userId) return null;
    const sb = getSupabase();

    const { data, error } = await sb.from('subjects').insert({
      user_id: userId, name, color, icon,
      exam_date: examDate || null,
      sort_order: get().subjects.length,
    }).select().single();

    if (error || !data) { console.error('addSubject error:', error); return null; }

    const subject: Subject = {
      id: data.id, name: data.name, color: data.color, icon: data.icon,
      examDate: data.exam_date || null, createdAt: data.created_at, sortOrder: data.sort_order || 0,
    };
    set((s) => ({ subjects: [...s.subjects, subject] }));
    return subject;
  },

  updateSubject: async (id, updates) => {
    const sb = getSupabase();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.examDate !== undefined) dbUpdates.exam_date = updates.examDate || null;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    set((s) => ({ subjects: s.subjects.map((x) => x.id === id ? { ...x, ...updates } : x) }));
    await sb.from('subjects').update(dbUpdates).eq('id', id);
  },

  deleteSubject: async (id) => {
    const chaptersToRemove = get().chapters.filter((c) => c.subjectId === id).map((c) => c.id);
    set((s) => ({
      subjects: s.subjects.filter((x) => x.id !== id),
      chapters: s.chapters.filter((c) => c.subjectId !== id),
      completionLogs: s.completionLogs.filter((l) => !chaptersToRemove.includes(l.chapterId)),
    }));
    const sb = getSupabase();
    await sb.from('subjects').delete().eq('id', id); // cascades to chapters, logs
  },

  // ── Chapter Actions ──
  addChapter: async (subjectId, name) => {
    const { userId } = get();
    if (!userId) return null;
    const sb = getSupabase();
    const existing = get().chapters.filter((c) => c.subjectId === subjectId);

    const { data, error } = await sb.from('chapters').insert({
      subject_id: subjectId, user_id: userId, name,
      chapter_number: existing.length + 1,
      status: 'not_started', sort_order: existing.length,
    }).select().single();

    if (error || !data) { console.error('addChapter error:', error); return null; }

    const chapter: Chapter = {
      id: data.id, subjectId: data.subject_id, name: data.name,
      chapterNumber: data.chapter_number, status: data.status || 'not_started',
      completedAt: data.completed_at || null, createdAt: data.created_at, sortOrder: data.sort_order || 0,
    };
    set((s) => ({ chapters: [...s.chapters, chapter] }));
    return chapter;
  },

  updateChapter: async (id, updates) => {
    const sb = getSupabase();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    set((s) => ({ chapters: s.chapters.map((x) => x.id === id ? { ...x, ...updates } : x) }));
    await sb.from('chapters').update(dbUpdates).eq('id', id);
  },

  deleteChapter: async (id) => {
    set((s) => ({
      chapters: s.chapters.filter((c) => c.id !== id),
      completionLogs: s.completionLogs.filter((l) => l.chapterId !== id),
    }));
    const sb = getSupabase();
    await sb.from('chapters').delete().eq('id', id);
  },

  toggleChapterComplete: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const chapter = get().chapters.find((c) => c.id === id);
    if (!chapter) return;

    const isCompleting = chapter.status !== 'completed';
    const now = new Date().toISOString();
    const sb = getSupabase();

    // Optimistic update
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.id === id ? { ...c, status: isCompleting ? 'completed' as const : 'not_started' as const, completedAt: isCompleting ? now : null } : c
      ),
      completionLogs: isCompleting
        ? [...s.completionLogs, { chapterId: id, completedAt: now }]
        : s.completionLogs.filter((l) => l.chapterId !== id),
    }));

    // DB sync
    await sb.from('chapters').update({
      status: isCompleting ? 'completed' : 'not_started',
      completed_at: isCompleting ? now : null,
    }).eq('id', id);

    if (isCompleting) {
      await sb.from('completion_logs').insert({ chapter_id: id, user_id: userId, completed_at: now });
    } else {
      await sb.from('completion_logs').delete().eq('chapter_id', id).eq('user_id', userId);
    }

    // Update streak
    const today = getToday();
    const { lastActiveDate, streak } = get();
    if (isCompleting && lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      const newStreak = lastActiveDate === yStr ? streak + 1 : 1;
      set({ streak: newStreak, lastActiveDate: today });
      await sb.from('profiles').update({ streak: newStreak, last_active_date: today }).eq('id', userId);
    }
  },

  // ── Target Actions ──
  addTarget: async (target) => {
    const { userId } = get();
    if (!userId) return;
    const sb = getSupabase();

    const { data, error } = await sb.from('targets').insert({
      user_id: userId, type: target.type, label: target.label,
      target_value: target.targetValue, subject_id: target.subjectId || null,
      start_date: target.startDate, end_date: target.endDate,
    }).select().single();

    if (error || !data) { console.error('addTarget error:', error); return; }

    const t: Target = {
      id: data.id, type: data.type, label: data.label, targetValue: data.target_value,
      subjectId: data.subject_id || null, startDate: data.start_date, endDate: data.end_date,
      createdAt: data.created_at,
    };
    set((s) => ({ targets: [...s.targets, t] }));
  },

  deleteTarget: async (id) => {
    set((s) => ({ targets: s.targets.filter((t) => t.id !== id) }));
    const sb = getSupabase();
    await sb.from('targets').delete().eq('id', id);
  },

  // ── Profile Actions ──
  updateProfile: async (updates) => {
    const { userId } = get();
    set((s) => ({ profile: { ...s.profile, ...updates } }));
    if (!userId) return;
    const sb = getSupabase();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.examLabel !== undefined) dbUpdates.exam_label = updates.examLabel;
    await sb.from('profiles').update(dbUpdates).eq('id', userId);
  },

  // ── Computed (unchanged) ──
  getSubjectChapters: (subjectId) => {
    return get().chapters.filter((c) => c.subjectId === subjectId).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getSubjectProgress: (subjectId) => {
    const chs = get().chapters.filter((c) => c.subjectId === subjectId);
    const done = chs.filter((c) => c.status === 'completed').length;
    return { completed: done, total: chs.length, percentage: chs.length === 0 ? 0 : Math.round((done / chs.length) * 100) };
  },

  getOverallProgress: () => {
    const chs = get().chapters;
    const done = chs.filter((c) => c.status === 'completed').length;
    return { completed: done, total: chs.length, percentage: chs.length === 0 ? 0 : Math.round((done / chs.length) * 100) };
  },

  getTodayCompletions: () => {
    const today = getToday();
    return get().completionLogs.filter((l) => l.completedAt.startsWith(today)).length;
  },

  getWeeklyData: () => {
    const logs = get().completionLogs;
    const data: { day: string; count: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data.push({ day: getDayName(dateStr), count: logs.filter((l) => l.completedAt.startsWith(dateStr)).length, date: dateStr });
    }
    return data;
  },

  getTargetProgress: (target) => {
    const logs = get().completionLogs;
    const start = new Date(target.startDate);
    const end = new Date(target.endDate);
    const now = new Date();
    let rel = logs.filter((l) => { const d = new Date(l.completedAt); return d >= start && d <= end; });
    if (target.subjectId) {
      const ids = get().chapters.filter((c) => c.subjectId === target.subjectId).map((c) => c.id);
      rel = rel.filter((l) => ids.includes(l.chapterId));
    }
    const done = rel.length;
    const pct = target.targetValue === 0 ? 0 : Math.round((done / target.targetValue) * 100);
    let status = 'on_track';
    if (done >= target.targetValue) status = 'completed';
    else if (now > end) status = 'missed';
    else {
      const totalD = (end.getTime() - start.getTime()) / 86400000;
      const elD = (now.getTime() - start.getTime()) / 86400000;
      if (done < (elD / totalD) * target.targetValue * 0.8) status = 'at_risk';
    }
    return { done, total: target.targetValue, percentage: Math.min(pct, 100), status };
  },
}));
