import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { QUIZ_CATEGORIES } from '../data/countries';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;
  const [showAnswers, setShowAnswers] = useState(false);

  if (!session) {
    navigate('/play');
    return null;
  }

  const { category, score, positiveScore, negativeScore, total, accuracy, streak, duration, answers, mode } = session;
  const cat = QUIZ_CATEGORIES.find(c => c.id === category);
  const isPerfect = accuracy === 100;
  const isGood = accuracy >= 70;

  const emoji = isPerfect ? '🏆' : isGood ? '🌟' : accuracy >= 40 ? '📚' : '🌍';
  const message = isPerfect ? 'Perfect Score!' : isGood ? 'Excellent Work!' : accuracy >= 40 ? 'Keep Learning!' : 'World Explorer!';

  const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80 }}>
      {isPerfect && <Confetti numberOfPieces={200} recycle={false} colors={['#e8c547', '#47b8e8', '#e87847', '#47e8b8']} />}

      <div className="container" style={{ maxWidth: 680, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Hero score card */}
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${cat?.color || 'var(--border)'}40`,
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            textAlign: 'center',
            marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
              width: 240, height: 240, borderRadius: '50%',
              background: cat?.color || 'var(--gold)',
              opacity: 0.05, filter: 'blur(60px)',
            }} />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ fontSize: 64, marginBottom: 12 }}
            >
              {emoji}
            </motion.div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
              {message}
            </h1>

            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
              {cat?.name} Quiz · {mode === 'mcq' ? 'Multiple Choice' : 'Type Mode'}
            </p>

            {/* Big accuracy ring */}
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 32px' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="56" fill="none" stroke="var(--border)" strokeWidth="8" />
                <motion.circle
                  cx="70" cy="70" r="56"
                  fill="none"
                  stroke={cat?.color || 'var(--gold)'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - accuracy / 100) }}
                  transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)' }}>{accuracy}%</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>accuracy</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              {[
                { icon: '✅', label: 'Correct', value: positiveScore || score },
                { icon: '❌', label: 'Wrong', value: negativeScore || (total - score) },
                { icon: '🔥', label: 'Best Streak', value: streak },
                { icon: '⏱️', label: 'Time', value: formatTime(duration) },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', minWidth: 70 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <Link to={`/play/${category}`} style={{ flex: 1 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '13px 20px',
                  background: cat?.color || 'var(--gold)',
                  color: '#0d0f1a', borderRadius: 10,
                  fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                🔄 Try Again
              </motion.button>
            </Link>
            <Link to="/play" style={{ flex: 1 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '13px 20px',
                  background: 'var(--bg-card)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, fontWeight: 600, fontSize: 15,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                🎮 New Category
              </motion.button>
            </Link>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '13px 20px',
                  background: 'var(--bg-card)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, fontWeight: 600, fontSize: 15,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                📊
              </motion.button>
            </Link>
          </div>

          {/* Answer review */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              style={{
                width: '100%', padding: '16px 20px',
                background: 'none', color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-body)', borderBottom: showAnswers ? '1px solid var(--border)' : 'none',
              }}
            >
              <span>Review Answers ({answers.length})</span>
              <span style={{ transition: 'transform 0.3s', display: 'inline-block', transform: showAnswers ? 'rotate(180deg)' : 'none' }}>▼</span>
            </button>

            <AnimatePresence>
              {showAnswers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '8px 0' }}>
                    {answers.map((a, i) => (
                      <div key={i} style={{
                        padding: '12px 20px',
                        borderBottom: i < answers.length - 1 ? '1px solid var(--border)' : 'none',
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                      }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                          background: a.isCorrect ? 'var(--success-dim)' : 'var(--error-dim)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12,
                        }}>
                          {a.isCorrect ? '✓' : '✗'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 3 }}>
                            {a.flag} {a.question}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: a.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                            {a.isCorrect ? a.correct : `${a.given} → ${a.correct}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
