import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QUIZ_CATEGORIES } from '../data/countries';
import { useGameStore } from '../context/gameStore';

export default function CategorySelect() {
  const { stats } = useGameStore();

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 40 }}
        >
          <Link to="/" style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            ← Back
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            Choose a Category
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select what you want to test yourself on</p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {QUIZ_CATEGORIES.map((cat, i) => {
            const catStats = stats.categoryStats[cat.id];
            const accuracy = catStats ? Math.round((catStats.correct / catStats.total) * 100) : null;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link to={`/play/${cat.id}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid var(--border)`,
                      borderRadius: 'var(--radius-xl)',
                      padding: '28px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Color stripe */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 4,
                      background: cat.color,
                      borderRadius: '4px 0 0 4px',
                    }} />

                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{
                          width: 56, height: 56,
                          background: cat.color + '18',
                          border: `1px solid ${cat.color}30`,
                          borderRadius: 16,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 28,
                        }}>
                          {cat.icon}
                        </div>
                        {accuracy !== null && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: cat.color }}>{accuracy}%</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{catStats.played} sessions</div>
                          </div>
                        )}
                      </div>

                      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{cat.name}</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                        {cat.description}
                      </p>

                      {catStats && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            height: 3, background: 'var(--border)',
                            borderRadius: 2, overflow: 'hidden',
                          }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${accuracy}%` }}
                              transition={{ delay: 0.4 + i * 0.08, duration: 0.8 }}
                              style={{
                                height: '100%',
                                background: cat.color,
                                borderRadius: 2,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, color: cat.color, fontWeight: 600,
                        padding: '6px 14px',
                        background: cat.color + '15',
                        borderRadius: 8,
                      }}>
                        {catStats ? 'Play Again' : 'Start Quiz'} →
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
