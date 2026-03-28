import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../context/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { QUIZ_CATEGORIES } from '../data/countries';
import { useAuthStore } from '../context/authStore';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('global'); // 'global', 'category', 'region'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [filter, selectedCategory]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let q;
      if (filter === 'global') {
        q = query(
          collection(db, 'users'),
          orderBy('stats.totalCorrect', 'desc'),
          limit(50)
        );
      } else if (filter === 'category' && selectedCategory) {
        q = query(
          collection(db, 'users'),
          orderBy(`stats.categoryStats.${selectedCategory}.correct`, 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc, idx) => ({
        ...doc.data(),
        rank: idx + 1,
      }));
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'var(--gold)';
    if (rank === 2) return '#a8a8a8'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return 'var(--text-secondary)';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="container">
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            🏆 Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            See how you rank against globe trotters worldwide
          </p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setFilter('global');
              setSelectedCategory(null);
            }}
            style={{
              padding: '8px 16px',
              background: filter === 'global' ? 'var(--gold-dim)' : 'var(--bg-card)',
              border: `1px solid ${filter === 'global' ? 'var(--gold)' : 'var(--border)'}`,
              color: filter === 'global' ? 'var(--gold)' : 'var(--text-secondary)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
          >
            🌍 Global
          </motion.button>

          {QUIZ_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setFilter('category');
                setSelectedCategory(cat.id);
              }}
              style={{
                padding: '8px 16px',
                background:
                  filter === 'category' && selectedCategory === cat.id
                    ? cat.color + '20'
                    : 'var(--bg-card)',
                border: `1px solid ${
                  filter === 'category' && selectedCategory === cat.id
                    ? cat.color
                    : 'var(--border)'
                }`,
                color:
                  filter === 'category' && selectedCategory === cat.id
                    ? cat.color
                    : 'var(--text-secondary)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {cat.icon} {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Leaderboard table */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>🌍</div>
            <p>Loading leaderboard...</p>
          </motion.div>
        ) : leaderboard.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-muted)',
            }}
          >
            <p>No players yet. Be the first! 🚀</p>
          </motion.div>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 150px 120px',
                gap: 16,
                padding: '16px 20px',
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              <div>Rank</div>
              <div>Player</div>
              <div style={{ textAlign: 'right' }}>
                {filter === 'global' ? 'Correct' : 'Score'}
              </div>
              <div style={{ textAlign: 'right' }}>Accuracy</div>
            </div>

            {/* Rows */}
            {leaderboard.map((player, idx) => {
              const isCurrentUser = user && player.uid === user.uid;
              const stats = player.stats || {};
              const accuracy =
                stats.totalQuestions > 0
                  ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
                  : 0;

              return (
                <motion.div
                  key={player.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 150px 120px',
                    gap: 16,
                    padding: '14px 20px',
                    borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                    background: isCurrentUser ? 'var(--gold-dim)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: getRankColor(player.rank),
                  }}>
                    {getRankMedal(player.rank)}
                  </div>

                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isCurrentUser ? 'var(--gold)' : 'var(--text-primary)',
                    }}>
                      {player.displayName}
                      {isCurrentUser && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--gold)' }}>
                          (You)
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}>
                      {stats.totalQuizzes || 0} quizzes
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700 }}>
                    {stats.totalCorrect || 0}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                      {accuracy}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
