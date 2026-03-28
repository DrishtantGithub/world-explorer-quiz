import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../context/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { useAuthStore } from '../context/authStore';
import { COUNTRIES, QUIZ_CATEGORIES, generateQuestion } from '../data/countries';

/**
 * Multiplayer Quiz System
 * - Real-time games using Firestore
 * - Players join shared game rooms
 * - Live score updates
 * - Competitive mode for multiple players
 */

export default function MultiplayerQuiz() {
  const navigate = useNavigate();
  const [view, setView] = useState('lobby'); // 'lobby', 'waiting', 'quiz', 'results'
  const [gameId, setGameId] = useState(null);
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuthStore();
  const [category, setCategory] = useState('flags');
  const [playerCount, setPlayerCount] = useState(2);
  const [playerName, setPlayerName] = useState(user?.displayName || '');

  // Create new game
  const createGame = async () => {
    if (!user) {
      setError('Please login to play multiplayer');
      return;
    }

    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setLoading(true);
    try {
      // Generate questions
      const shuffled = [...COUNTRIES].sort(() => Math.random() - 0.5).slice(0, 10);
      const cat = QUIZ_CATEGORIES.find((c) => c.id === category);
      const questions = shuffled.map((country) => {
        const q = generateQuestion(category, COUNTRIES, shuffled.filter((c) => c.code !== country.code).map((c) => c.code));
        return { ...q, country };
      });

      // Create game document
      const gameRef = await addDoc(collection(db, 'multiplayer_games'), {
        category,
        status: 'waiting', // 'waiting' -> 'active' -> 'finished'
        maxPlayers: playerCount,
        currentPlayers: 1,
        questions: JSON.stringify(questions),
        currentQuestion: 0,
        createdAt: new Date(),
        createdBy: user.uid,
        players: {
          [user.uid]: {
            uid: user.uid,
            name: playerName,
            score: 0,
            answers: [],
          },
        },
      });

      setGameId(gameRef.id);
      setView('waiting');

      // Listen for game updates
      subscribeToGame(gameRef.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Join existing game
  const joinGame = async (id) => {
    if (!user) {
      setError('Please login to play multiplayer');
      return;
    }

    setLoading(true);
    try {
      const gameRef = doc(db, 'multiplayer_games', id);
      const gameSnap = await getDoc(gameRef);
      const gameData = gameSnap.data();
      
      // Get current game state
      await updateDoc(gameRef, {
        [`players.${user.uid}`]: {
          uid: user.uid,
          name: playerName || user.displayName,
          score: 0,
          answers: [],
        },
        currentPlayers: (gameData?.currentPlayers || 0) + 1,
      });

      setGameId(id);
      setView('waiting');
      subscribeToGame(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to game updates
  const subscribeToGame = (gameId) => {
    const unsub = onSnapshot(doc(db, 'multiplayer_games', gameId), (docSnap) => {
      const gameData = docSnap.data();
      setGame(gameData);
      setPlayers(Object.values(gameData.players || {}));

      if (gameData.status === 'active' && view === 'waiting') {
        setView('quiz');
      }
    });

    return unsub;
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!game || revealed) return;

    setLoading(true);
    try {
      const questions = JSON.parse(game.questions);
      const question = questions[currentQuestion];
      let isCorrect = false;

      if (game.category === 'flags' || game.category.includes('mcq')) {
        isCorrect = selected === question.answer;
      } else {
        const norm = (str) =>
          str.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
        isCorrect = norm(typed) === norm(question.answer);
      }

      // Update player score
      const gameRef = doc(db, 'multiplayer_games', gameId);
      const updatedPlayers = { ...game.players };
      updatedPlayers[user.uid].answers.push({
        question: question.question,
        correct: question.answer,
        given: selected || typed,
        isCorrect,
      });

      if (isCorrect) {
        updatedPlayers[user.uid].score += 1;
      }

      await updateDoc(gameRef, {
        players: updatedPlayers,
      });

      setRevealed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Next question
  const nextQuestion = async () => {
    const questions = JSON.parse(game.questions);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelected(null);
      setTyped('');
      setRevealed(false);
    } else {
      // Game finished
      const gameRef = doc(db, 'multiplayer_games', gameId);
      await updateDoc(gameRef, { status: 'finished' });
      setView('results');
    }
  };

  // LOBBY VIEW
  if (view === 'lobby') {
    return (
      <div style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32, textAlign: 'center' }}
          >
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
              🎮 Multiplayer Quiz
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Challenge your friends and compete for glory
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'var(--error-dim)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: 8,
                padding: '12px 14px',
                color: 'var(--error)',
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              {error}
            </motion.div>
          )}

          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'var(--gold-dim)',
                border: '1px solid var(--gold)',
                borderRadius: 8,
                padding: '14px',
                marginBottom: 24,
                fontSize: 13,
                color: 'var(--gold)',
                textAlign: 'center',
              }}
            >
              Please <a href="/login" style={{ color: 'white', fontWeight: 600 }}>login</a> to play multiplayer.
            </motion.div>
          )}

          {/* Player name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
              }}
            >
              {QUIZ_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Player count */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Max Players: {playerCount}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Create game */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createGame}
            disabled={loading || !user}
            style={{
              width: '100%',
              padding: '13px 20px',
              background: user ? 'var(--gold)' : 'var(--text-muted)',
              color: '#0d0f1a',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              cursor: loading || !user ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: 12,
            }}
          >
            {loading ? 'Creating...' : '🚀 Create Game'}
          </motion.button>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            (Share the room code with friends to join)
          </p>
        </div>
      </div>
    );
  }

  // WAITING VIEW
  if (view === 'waiting') {
    return (
      <div style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px 32px',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16, animation: 'pulse 2s ease-in-out infinite' }}>
              ⏳
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Waiting for Players
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              {players.length} / {game?.maxPlayers || 2} players
            </p>

            {/* Player list */}
            <div style={{ marginBottom: 24 }}>
              {players.map((player, idx) => (
                <motion.div
                  key={player.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 8,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>✓</span>
                  <span style={{ fontWeight: 600 }}>{player.name}</span>
                  {player.uid === user?.uid && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gold)' }}>(You)</span>}
                </motion.div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Game will start when all players join
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // QUIZ VIEW (similar to regular quiz but with live scores)
  if (view === 'quiz' && game) {
    const questions = JSON.parse(game.questions);
    const question = questions[currentQuestion];

    return (
      <div style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Live scores */}
          <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            {players.sort((a, b) => b.score - a.score).map((player) => (
              <motion.div
                key={player.uid}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                style={{
                  background: player.uid === user?.uid ? 'var(--gold-dim)' : 'var(--bg-card)',
                  border: `1px solid ${player.uid === user?.uid ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {player.name}
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: player.uid === user?.uid ? 'var(--gold)' : 'var(--text-primary)',
                }}>
                  {player.score}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 16 }}>{question.display}</div>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>{question.question}</h3>

            {game.category === 'flags' || question.options ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 10, justifyContent: 'center' }}>
                {question.options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(opt)}
                    disabled={revealed}
                    style={{
                      padding: '12px 20px',
                      background: selected === opt ? 'var(--gold)' : 'var(--bg-primary)',
                      color: selected === opt ? '#0d0f1a' : 'var(--text-primary)',
                      border: `1px solid ${selected === opt ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: revealed ? 'default' : 'pointer',
                      opacity: revealed ? (selected === opt ? 1 : 0.5) : 1,
                    }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Type your answer..."
                disabled={revealed}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  marginBottom: 16,
                }}
              />
            )}

            {!revealed ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitAnswer}
                disabled={!selected && !typed}
                style={{
                  padding: '12px 24px',
                  background: 'var(--gold)',
                  color: '#0d0f1a',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: !selected && !typed ? 'not-allowed' : 'pointer',
                  opacity: !selected && !typed ? 0.5 : 1,
                }}
              >
                Submit
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextQuestion}
                style={{
                  padding: '12px 24px',
                  background: 'var(--gold)',
                  color: '#0d0f1a',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                Next →
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // RESULTS VIEW
  if (view === 'results') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const userRank = sortedPlayers.findIndex((p) => p.uid === user?.uid) + 1;

    return (
      <div style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px 32px',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 64, marginBottom: 12 }}
            >
              🏆
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
              Game Over!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              {userRank === 1 ? 'You won! 🥇' : `You placed #${userRank}`}
            </p>

            {/* Final leaderboard */}
            {sortedPlayers.map((player, idx) => (
              <motion.div
                key={player.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  background: player.uid === user?.uid ? 'var(--gold-dim)' : 'var(--bg-primary)',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 800, minWidth: 30 }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <span style={{ flex: 1, fontWeight: 600 }}>{player.name}</span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{player.score} pts</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/play')}
            style={{
              width: '100%',
              padding: '13px 20px',
              background: 'var(--gold)',
              color: '#0d0f1a',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Back to Menu
          </motion.button>
        </div>
      </div>
    );
  }
}
