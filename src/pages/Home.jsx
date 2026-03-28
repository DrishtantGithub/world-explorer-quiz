import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../context/gameStore';
import { QUIZ_CATEGORIES } from '../data/countries';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const GLOBE_COUNTRIES = ['🇯🇵', '🇫🇷', '🇧🇷', '🇮🇳', '🇳🇬', '🇦🇺', '🇲🇽', '🇩🇪', '🇿🇦', '🇰🇷', '🇪🇬', '🇦🇷', '🇨🇦', '🇮🇩', '🇹🇷'];

export default function Home() {
  const { stats } = useGameStore();
  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : null;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 60 }}>
        {/* Floating flags background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {GLOBE_COUNTRIES.map((flag, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.15, 0],
                y: ['100%', '-20%'],
                x: `${(i / GLOBE_COUNTRIES.length) * 100}%`,
              }}
              transition={{
                duration: 12 + i * 1.2,
                delay: i * 0.8,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                fontSize: 32 + (i % 3) * 12,
                filter: 'blur(1px)',
              }}
            >
              {flag}
            </motion.div>
          ))}
        </div>

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <motion.div {...fadeUp(0)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--gold-dim)', border: '1px solid rgba(232,197,71,0.3)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
            fontSize: 13, color: 'var(--gold)', fontWeight: 500,
          }}>
            <span style={{ animation: 'float 2s ease-in-out infinite' }}>🌍</span>
            195 Countries · 6 Categories
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: 20,
          }}>
            Master the<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--gold) 0%, #f5d87a 50%, var(--gold) 100%)',
              backgroundSize: '200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              World
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} style={{
            fontSize: 18, color: 'var(--text-secondary)',
            maxWidth: 480, margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            Test your knowledge of flags, capitals, currencies, languages, and more. 
            Track your progress and become a true globe trotter.
          </motion.p>

          <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/play">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'var(--gold)',
                  color: '#0d0f1a',
                  padding: '14px 32px',
                  borderRadius: 12,
                  fontSize: 16, fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 0 30px var(--gold-glow)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                Start Playing <span>🎮</span>
              </motion.button>
            </Link>
            <Link to="/explore">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  padding: '14px 32px',
                  borderRadius: 12,
                  fontSize: 16, fontWeight: 500,
                  border: '1px solid var(--border-bright)',
                  fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                Explore Countries <span>🗺️</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats bar */}
          {stats.totalQuizzes > 0 && (
            <motion.div {...fadeUp(0.4)} style={{
              marginTop: 48,
              display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {[
                { label: 'Quizzes', value: stats.totalQuizzes, icon: '🎯' },
                { label: 'Questions', value: stats.totalQuestions, icon: '❓' },
                { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
                { label: 'Best Streak', value: stats.bestStreak, icon: '🔥' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 20px',
                  minWidth: 100,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <motion.div {...fadeUp(0.2)} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Quiz Categories
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Six ways to test your world knowledge</p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {QUIZ_CATEGORIES.map((cat, i) => (
              <motion.div key={cat.id} {...fadeUp(0.1 + i * 0.07)}>
                <Link to={`/play/${cat.id}`}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                    onHoverStart={(e) => e.currentTarget.style.borderColor = cat.color + '50'}
                    onHoverEnd={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {/* Color glow */}
                    <div style={{
                      position: 'absolute', top: -30, right: -30,
                      width: 100, height: 100,
                      borderRadius: '50%',
                      background: cat.color,
                      opacity: 0.06,
                      filter: 'blur(20px)',
                    }} />
                    
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{cat.name}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{cat.description}</p>
                    
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 13, color: cat.color, fontWeight: 500,
                    }}>
                      Play now <span>→</span>
                    </div>

                    {stats.categoryStats[cat.id] && (
                      <div style={{
                        position: 'absolute', top: 16, right: 16,
                        background: cat.color + '20',
                        border: `1px solid ${cat.color}40`,
                        borderRadius: 6, padding: '2px 8px',
                        fontSize: 11, color: cat.color, fontWeight: 600,
                      }}>
                        {Math.round(stats.categoryStats[cat.id].correct / stats.categoryStats[cat.id].total * 100)}%
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ paddingTop: 60 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}>
            {[
              { icon: '⌨️', title: 'Type or Select', desc: 'Two quiz modes: free-type or multiple choice' },
              { icon: '📊', title: 'Track Progress', desc: 'Detailed stats, streaks and session history' },
              { icon: '🏆', title: 'Achievements', desc: 'Unlock badges as you improve your knowledge' },
              { icon: '🗺️', title: 'Explore Mode', desc: 'Browse all countries and learn at your own pace' },
            ].map((f, i) => (
              <motion.div key={f.title} {...fadeUp(0.2 + i * 0.07)} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <h4 style={{ fontWeight: 600, marginBottom: 6 }}>{f.title}</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
