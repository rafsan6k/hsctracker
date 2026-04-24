'use client';

import { useStudyStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Progress Ring Component ───────────────────────────────
function ProgressRing({ percentage, size = 200, strokeWidth = 12 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  const getColor = () => {
    if (percentage >= 90) return 'url(#gradient-green)';
    if (percentage >= 70) return '#14B8A6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#00E5C3" />
        </linearGradient>
        <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#a078ff" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={percentage > 0 ? getColor() : 'rgba(255,255,255,0.04)'}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
    </svg>
  );
}

// ── Weekly Bar Chart ──────────────────────────────────────
function WeeklyChart({ data }: { data: { day: string; count: number; date: string }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 8px' }}>
      {data.map((d, i) => {
        const height = Math.max((d.count / maxCount) * 100, 4);
        const isToday = d.date === today;
        return (
          <div key={i} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {d.count > 0 ? d.count : ''}
            </span>
            <div style={{
              width: '100%',
              maxWidth: 32,
              height: `${height}%`,
              borderRadius: 6,
              background: isToday
                ? 'linear-gradient(180deg, #8B5CF6, #a078ff)'
                : 'rgba(139, 92, 246, 0.2)',
              transition: 'height 0.6s ease',
              transitionDelay: `${i * 80}ms`,
              minHeight: 4,
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: isToday ? 700 : 500,
              color: isToday ? '#d0bcff' : 'var(--color-text-muted)',
            }}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Motivational Message ──────────────────────────────────
function getMotivation(percentage: number, todayDone: boolean): string {
  if (todayDone) return "Target hit today! 🎯 Rest well.";
  if (percentage > 90) return "Almost there. Finish strong. 💪";
  if (percentage > 60) return "You're in the home stretch. Don't stop now. 🚀";
  if (percentage > 30) return "Great momentum. Keep pushing. 🔥";
  return "Every chapter counts. Let's build momentum. ✨";
}

// ── Dashboard Page ────────────────────────────────────────
export default function DashboardPage() {
  const subjects = useStudyStore((s) => s.subjects);
  const chapters = useStudyStore((s) => s.chapters);
  const getOverallProgress = useStudyStore((s) => s.getOverallProgress);
  const getSubjectProgress = useStudyStore((s) => s.getSubjectProgress);
  const getTodayCompletions = useStudyStore((s) => s.getTodayCompletions);
  const getWeeklyData = useStudyStore((s) => s.getWeeklyData);
  const targets = useStudyStore((s) => s.targets);
  const profile = useStudyStore((s) => s.profile);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <DashboardSkeleton />;

  const overall = getOverallProgress();
  const todayCount = getTodayCompletions();
  const weeklyData = getWeeklyData();
  const activeSubjects = subjects.filter((s) => chapters.some((c) => c.subjectId === s.id));

  // Find active daily target
  const today = new Date().toISOString().split('T')[0];
  const dailyTarget = targets.find((t) => t.type === 'daily' && t.startDate <= today && t.endDate >= today);
  const dailyTargetValue = dailyTarget?.targetValue || 5;
  const todayTargetHit = todayCount >= dailyTargetValue;

  // Sort subjects by completion % ascending (weakest first)
  const sortedSubjects = [...subjects].sort((a, b) => {
    const pa = getSubjectProgress(a.id).percentage;
    const pb = getSubjectProgress(b.id).percentage;
    return pa - pb;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          marginBottom: 4,
        }}>
          Welcome back, {profile.displayName}.
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
          {getMotivation(overall.percentage, todayTargetHit)}
        </p>
      </div>

      {/* Top Row: Ring + Stats */}
      <div className="animate-fade-up" style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 24,
        animationDelay: '80ms',
      }}>
        {/* Overall Ring */}
        <div className="glass-card-static" style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minWidth: 240,
        }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ProgressRing percentage={overall.percentage} size={180} strokeWidth={10} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)',
              }}>
                {overall.percentage}%
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Overall
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          <StatCard icon="check_circle" label="Chapters Done" value={overall.completed} color="#10B981" />
          <StatCard icon="pending" label="Remaining" value={overall.total - overall.completed} color="#F59E0B" />
          <StatCard icon="school" label="Active Subjects" value={activeSubjects.length} color="#8B5CF6" />
          <StatCard icon="today" label="Today's Progress" value={`${todayCount}/${dailyTargetValue}`} color="#00E5C3" />
        </div>
      </div>

      {/* Today's Target + Weekly Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Today's Target */}
        <div className="glass-card-static animate-fade-up" style={{
          padding: 24,
          animationDelay: '160ms',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today&apos;s Target</h3>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 8,
              background: todayTargetHit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.1)',
              color: todayTargetHit ? '#10B981' : '#d0bcff',
            }}>
              {todayTargetHit ? '✓ Complete' : 'In Progress'}
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {todayCount}
            </span>
            <span style={{ fontSize: 16, color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {' '}/ {dailyTargetValue} chapters
            </span>
          </div>

          <div style={{
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            <div className="progress-bar-fill" style={{
              height: '100%',
              borderRadius: 3,
              background: todayTargetHit
                ? 'linear-gradient(90deg, #10B981, #00E5C3)'
                : 'linear-gradient(90deg, #8B5CF6, #a078ff)',
              width: `${Math.min((todayCount / dailyTargetValue) * 100, 100)}%`,
            }} />
          </div>

          <Link href="/mark" className="btn-primary" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            fontSize: 13,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>edit_note</span>
            Mark Progress
          </Link>
        </div>

        {/* Weekly Activity */}
        <div className="glass-card-static animate-fade-up" style={{
          padding: 24,
          animationDelay: '240ms',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Weekly Activity</h3>
          <WeeklyChart data={weeklyData} />
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="animate-fade-up" style={{ animationDelay: '320ms' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Subject Progress</h3>

        {sortedSubjects.length === 0 ? (
          <div className="glass-card-static" style={{
            padding: 48,
            textAlign: 'center',
          }}>
            <span className="material-symbols-rounded" style={{
              fontSize: 48,
              color: 'var(--color-text-muted)',
              marginBottom: 12,
              display: 'block',
            }}>
              menu_book
            </span>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 16 }}>
              Your journey starts here. Add your first subject to see your progress.
            </p>
            <Link href="/syllabus" className="btn-primary" style={{ textDecoration: 'none' }}>
              Add Subject
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedSubjects.map((subject) => {
              const progress = getSubjectProgress(subject.id);
              return (
                <Link key={subject.id} href="/syllabus" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${subject.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span className="material-symbols-rounded" style={{
                          fontSize: 20,
                          color: subject.color,
                        }}>
                          {subject.icon}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{subject.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {progress.completed} / {progress.total} chapters
                        </div>
                      </div>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: progress.percentage >= 70 ? '#10B981' : progress.percentage >= 40 ? '#F59E0B' : 'var(--color-text-secondary)',
                      }}>
                        {progress.percentage}%
                      </span>
                    </div>
                    <div style={{
                      height: 5,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.04)',
                      overflow: 'hidden',
                    }}>
                      <div className="progress-bar-fill" style={{
                        height: '100%',
                        borderRadius: 3,
                        background: subject.color,
                        width: `${progress.percentage}%`,
                        opacity: 0.8,
                      }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card-static" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span className="material-symbols-rounded" style={{ fontSize: 20, color }}>{icon}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>{value}</span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ height: 32, width: 300, borderRadius: 8, background: 'var(--color-bg-card)' }} />
        <div style={{ height: 18, width: 200, borderRadius: 6, background: 'var(--color-bg-card)', marginTop: 8 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24 }}>
        <div style={{ width: 240, height: 240, borderRadius: 16, background: 'var(--color-bg-card)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ borderRadius: 16, background: 'var(--color-bg-card)', minHeight: 90 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
