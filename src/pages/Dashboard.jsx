import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useGameStore, ACHIEVEMENTS } from '../context/gameStore';
import { QUIZ_CATEGORIES } from '../data/countries';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.name === 'Accuracy' ? '%' : ''}</div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { stats, resetStats } = useGameStore();

  const totalAccuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;

  // Category bar data
  const categoryData = QUIZ_CATEGORIES.map(cat => {
    const s = stats.categoryStats[cat.id];
    return {
      name: cat.name,
      icon: cat.icon,
      Accuracy: s ? Math.round((s.correct / s.total) * 100) : 0,
      Sessions: s?.played || 0,
      color: cat.color,
    };
  }).filter(d => d.Sessions > 0);

  // Recent sessions line data
  const recentData = [...(stats.recentSessions || [])].reverse().slice(-15).map((s, i) => ({
    i: i + 1,
    Accuracy: s.accuracy,
    Score: s.score,
  }));

  const earned = (stats.achievements || []);

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="container">
        <motion.div {...fadeUp(0)} style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
            Your Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your world knowledge journey</p>
        </motion.div>

        {stats.totalQuizzes === 0 ? (
          <motion.div {...fadeUp(0.1)} style={{
            textAlign: 'center', padding: '80px 40px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 12 }}>No data yet!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Complete a quiz to see your stats here.</p>
          </motion.div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 14, marginBottom: 24,
            }}>
              {[
                { label: 'Total Quizzes', value: stats.totalQuizzes, icon: '🎮', color: 'var(--gold)' },
                { label: 'Questions Answered', value: stats.totalQuestions, icon: '❓', color: 'var(--blue)' },
                { label: 'Overall Accuracy', value: `${totalAccuracy}%`, icon: '🎯', color: 'var(--teal)' },
                { label: 'Best Streak', value: stats.bestStreak, icon: '🔥', color: 'var(--orange)' },
                { label: 'Achievements', value: `${earned.length}/${ACHIEVEMENTS.length}`, icon: '🏆', color: 'var(--purple)' },
              ].map((s, i) => (
                <motion.div key={s.label} {...fadeUp(0.05 * i)} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                    borderRadius: '50%', background: s.color, opacity: 0.08, filter: 'blur(20px)',
                  }} />
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Category accuracy */}
              {categoryData.length > 0 && (
                <motion.div {...fadeUp(0.2)} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '24px',
                }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Category Accuracy</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="Accuracy" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Accuracy over time */}
              {recentData.length > 1 && (
                <motion.div {...fadeUp(0.25)} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '24px',
                }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Accuracy Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={recentData} margin={{ top: 0, right: 10, bottom: 0, left: -30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="i" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Accuracy" stroke="var(--teal)" strokeWidth={2} dot={{ fill: 'var(--teal)', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Category breakdown */}
            {Object.keys(stats.categoryStats).length > 0 && (
              <motion.div {...fadeUp(0.3)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20,
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Category Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {QUIZ_CATEGORIES.map(cat => {
                    const s = stats.categoryStats[cat.id];
                    if (!s) return null;
                    const acc = Math.round((s.correct / s.total) * 100);
                    return (
                      <div key={cat.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{cat.icon}</span>
                            <span style={{ fontWeight: 500 }}>{cat.name}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.played} sessions · {s.total} Qs</span>
                          </span>
                          <span style={{ fontWeight: 700, color: cat.color }}>{acc}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${acc}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{ height: '100%', background: cat.color, borderRadius: 2 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Achievements */}
            <motion.div {...fadeUp(0.35)} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20,
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>Achievements</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{earned.length} of {ACHIEVEMENTS.length} unlocked</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {ACHIEVEMENTS.map(a => {
                  const unlocked = earned.includes(a.id);
                  return (
                    <div key={a.id} style={{
                      padding: '14px 16px',
                      background: unlocked ? 'var(--gold-dim)' : 'var(--bg-secondary)',
                      border: `1px solid ${unlocked ? 'rgba(232,197,71,0.3)' : 'var(--border)'}`,
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', gap: 12,
                      opacity: unlocked ? 1 : 0.4,
                    }}>
                      <span style={{ fontSize: 24, filter: unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: unlocked ? 'var(--gold)' : 'var(--text-secondary)' }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent sessions */}
            {stats.recentSessions?.length > 0 && (
              <motion.div {...fadeUp(0.4)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20,
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Recent Sessions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.recentSessions.slice(0, 10).map(s => {
                    const cat = QUIZ_CATEGORIES.find(c => c.id === s.category);
                    return (
                      <div key={s.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 8,
                      }}>
                        <span style={{ fontSize: 20 }}>{cat?.icon || '🌍'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{cat?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {new Date(s.date).toLocaleDateString()} · {s.mode === 'mcq' ? 'Choice' : 'Type'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontWeight: 700, fontSize: 15,
                            color: s.accuracy >= 70 ? 'var(--success)' : s.accuracy >= 40 ? 'var(--gold)' : 'var(--error)',
                          }}>
                            {s.accuracy}%
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.score}/{s.total}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Reset */}
            <motion.div {...fadeUp(0.45)} style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  if (confirm('Reset all your stats? This cannot be undone.')) resetStats();
                }}
                style={{
                  background: 'none', color: 'var(--text-muted)', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  textDecoration: 'underline',
                }}
              >
                Reset all statistics
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
