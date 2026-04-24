'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, Chapter, Target, Badge, CompletionLog, UserProfile } from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

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

  // ── Subject Actions ──
  addSubject: (name: string, color: string, icon: string, examDate: string | null) => Subject;
  updateSubject: (id: string, updates: Partial<Omit<Subject, 'id'>>) => void;
  deleteSubject: (id: string) => void;

  // ── Chapter Actions ──
  addChapter: (subjectId: string, name: string) => Chapter;
  updateChapter: (id: string, updates: Partial<Omit<Chapter, 'id'>>) => void;
  deleteChapter: (id: string) => void;
  toggleChapterComplete: (id: string) => void;

  // ── Target Actions ──
  addTarget: (target: Omit<Target, 'id' | 'createdAt'>) => void;
  deleteTarget: (id: string) => void;

  // ── Profile Actions ──
  updateProfile: (updates: Partial<UserProfile>) => void;

  // ── Computed ──
  getSubjectChapters: (subjectId: string) => Chapter[];
  getSubjectProgress: (subjectId: string) => { completed: number; total: number; percentage: number };
  getOverallProgress: () => { completed: number; total: number; percentage: number };
  getTodayCompletions: () => number;
  getWeeklyData: () => { day: string; count: number; date: string }[];
  getTargetProgress: (target: Target) => { done: number; total: number; percentage: number; status: string };

  // ── Streak ──
  checkAndUpdateStreak: () => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      subjects: [],
      chapters: [],
      targets: [],
      badges: [],
      completionLogs: [],
      profile: {
        displayName: 'Student',
        examLabel: 'HSC 2026',
        dailyReminderTime: '20:00',
        theme: 'dark',
      },
      streak: 0,
      lastActiveDate: null,

      // ── Subject Actions ──
      addSubject: (name, color, icon, examDate) => {
        const subject: Subject = {
          id: generateId(),
          name,
          color,
          icon,
          examDate,
          createdAt: new Date().toISOString(),
          sortOrder: get().subjects.length,
        };
        set((state) => ({ subjects: [...state.subjects, subject] }));
        return subject;
      },

      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      deleteSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          chapters: state.chapters.filter((c) => c.subjectId !== id),
          completionLogs: state.completionLogs.filter(
            (l) => !state.chapters.find((c) => c.id === l.chapterId && c.subjectId === id)
          ),
        }));
      },

      // ── Chapter Actions ──
      addChapter: (subjectId, name) => {
        const subjectChapters = get().chapters.filter((c) => c.subjectId === subjectId);
        const chapter: Chapter = {
          id: generateId(),
          subjectId,
          name,
          chapterNumber: subjectChapters.length + 1,
          status: 'not_started',
          completedAt: null,
          createdAt: new Date().toISOString(),
          sortOrder: subjectChapters.length,
        };
        set((state) => ({ chapters: [...state.chapters, chapter] }));
        return chapter;
      },

      updateChapter: (id, updates) => {
        set((state) => ({
          chapters: state.chapters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteChapter: (id) => {
        set((state) => ({
          chapters: state.chapters.filter((c) => c.id !== id),
          completionLogs: state.completionLogs.filter((l) => l.chapterId !== id),
        }));
      },

      toggleChapterComplete: (id) => {
        const chapter = get().chapters.find((c) => c.id === id);
        if (!chapter) return;

        const isCompleting = chapter.status !== 'completed';
        const now = new Date().toISOString();

        set((state) => ({
          chapters: state.chapters.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: isCompleting ? 'completed' : 'not_started',
                  completedAt: isCompleting ? now : null,
                }
              : c
          ),
          completionLogs: isCompleting
            ? [...state.completionLogs, { chapterId: id, completedAt: now }]
            : state.completionLogs.filter((l) => l.chapterId !== id),
        }));

        // Update streak
        get().checkAndUpdateStreak();
      },

      // ── Target Actions ──
      addTarget: (target) => {
        const newTarget: Target = {
          ...target,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ targets: [...state.targets, newTarget] }));
      },

      deleteTarget: (id) => {
        set((state) => ({
          targets: state.targets.filter((t) => t.id !== id),
        }));
      },

      // ── Profile Actions ──
      updateProfile: (updates) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
      },

      // ── Computed ──
      getSubjectChapters: (subjectId) => {
        return get()
          .chapters.filter((c) => c.subjectId === subjectId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getSubjectProgress: (subjectId) => {
        const chapters = get().chapters.filter((c) => c.subjectId === subjectId);
        const completed = chapters.filter((c) => c.status === 'completed').length;
        const total = chapters.length;
        return {
          completed,
          total,
          percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      },

      getOverallProgress: () => {
        const chapters = get().chapters;
        const completed = chapters.filter((c) => c.status === 'completed').length;
        const total = chapters.length;
        return {
          completed,
          total,
          percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      },

      getTodayCompletions: () => {
        const today = getToday();
        return get().completionLogs.filter((l) => l.completedAt.startsWith(today)).length;
      },

      getWeeklyData: () => {
        const logs = get().completionLogs;
        const data: { day: string; count: number; date: string }[] = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const count = logs.filter((l) => l.completedAt.startsWith(dateStr)).length;
          data.push({ day: getDayName(dateStr), count, date: dateStr });
        }

        return data;
      },

      getTargetProgress: (target) => {
        const logs = get().completionLogs;
        const startDate = new Date(target.startDate);
        const endDate = new Date(target.endDate);
        const now = new Date();

        let relevantLogs = logs.filter((l) => {
          const logDate = new Date(l.completedAt);
          return logDate >= startDate && logDate <= endDate;
        });

        if (target.subjectId) {
          const subjectChapterIds = get()
            .chapters.filter((c) => c.subjectId === target.subjectId)
            .map((c) => c.id);
          relevantLogs = relevantLogs.filter((l) => subjectChapterIds.includes(l.chapterId));
        }

        const done = relevantLogs.length;
        const total = target.targetValue;
        const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

        let status = 'on_track';
        if (done >= total) {
          status = 'completed';
        } else if (now > endDate) {
          status = 'missed';
        } else {
          const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          const expectedProgress = (elapsedDays / totalDays) * total;
          if (done < expectedProgress * 0.8) {
            status = 'at_risk';
          }
        }

        return { done, total, percentage: Math.min(percentage, 100), status };
      },

      // ── Streak ──
      checkAndUpdateStreak: () => {
        const today = getToday();
        const { lastActiveDate, streak } = get();

        if (lastActiveDate === today) return; // Already updated today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActiveDate === yesterdayStr) {
          set({ streak: streak + 1, lastActiveDate: today });
        } else if (lastActiveDate !== today) {
          set({ streak: 1, lastActiveDate: today });
        }
      },
    }),
    {
      name: 'studyflow-storage',
    }
  )
);
