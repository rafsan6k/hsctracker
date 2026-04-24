// ── Core Types ──────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  examDate: string | null;
  createdAt: string;
  sortOrder: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  chapterNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
  createdAt: string;
  sortOrder: number;
}

export type TargetType = 'daily' | 'weekly' | 'monthly' | 'subject' | 'exam';
export type TargetStatus = 'on_track' | 'at_risk' | 'missed' | 'completed';

export interface Target {
  id: string;
  type: TargetType;
  label: string;
  targetValue: number;
  subjectId: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export type BadgeKey =
  | 'first_step'
  | 'week_warrior'
  | 'subject_slayer'
  | 'halfway_hero'
  | 'ready_to_fly'
  | 'daily_grinder';

export interface Badge {
  key: BadgeKey;
  earnedAt: string;
}

export interface CompletionLog {
  chapterId: string;
  completedAt: string;
}

export interface UserProfile {
  displayName: string;
  examLabel: string;
  dailyReminderTime: string;
  theme: 'dark' | 'light' | 'system';
}

// ── Preset Colors ───────────────────────────────────────────────

export const SUBJECT_COLORS = [
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#A855F7', // Purple
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export const SUBJECT_ICONS = [
  { key: 'science', label: 'Science' },
  { key: 'functions', label: 'Math' },
  { key: 'auto_stories', label: 'Literature' },
  { key: 'language', label: 'Language' },
  { key: 'public', label: 'Geography' },
  { key: 'history_edu', label: 'History' },
  { key: 'psychology', label: 'Psychology' },
  { key: 'biotech', label: 'Biology' },
  { key: 'computer', label: 'Computer' },
  { key: 'palette', label: 'Art' },
  { key: 'music_note', label: 'Music' },
  { key: 'fitness_center', label: 'Physical Ed' },
  { key: 'account_balance', label: 'Economics' },
  { key: 'gavel', label: 'Law' },
  { key: 'architecture', label: 'Engineering' },
  { key: 'school', label: 'General' },
];
