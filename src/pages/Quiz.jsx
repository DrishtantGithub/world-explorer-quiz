import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, QUIZ_CATEGORIES, generateQuestion } from '../data/countries';
import { useGameStore } from '../context/gameStore';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category, mode, length, region } = location.state || {};

  const { startSession, recordAnswer, endSession, currentSession } = useGameStore();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  const cat = QUIZ_CATEGORIES.find(c => c.id === category);

  // Build question list
  useEffect(() => {
    if (!category) { navigate('/play'); return; }

    const filtered = region === 'All'
      ? COUNTRIES
      : COUNTRIES.filter(c => c.continent === region || c.subregion?.includes(region));

    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, length);
    
    // Build questions with correct answer options
    const built = shuffled.map(country => {
      const catDef = QUIZ_CATEGORIES.find(c => c.id === category);
      const qData = catDef.questionFn(country);
      
      // Generate wrong options from other countries
      const otherCountries = COUNTRIES.filter(c => c.code !== country.code)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      let wrongAnswers;
      if (category === "flags") {
        wrongAnswers = otherCountries.map(c => c.name);
      } else if (category === "capitals") {
        wrongAnswers = otherCountries.map(c => c.capital);
      } else if (category === "currencies") {
        wrongAnswers = otherCountries.map(c => c.currency);
      } else if (category === "populations") {
        wrongAnswers = otherCountries.map(c => new Intl.NumberFormat().format(c.population));
      } else if (category === "continents") {
        const continents = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"];
        wrongAnswers = continents.filter(c => c !== qData.answer).sort(() => Math.random() - 0.5).slice(0, 3);
      } else if (category === "languages") {
        wrongAnswers = otherCountries.map(c => c.languages[0]);
      }
      
      const options = [qData.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return { ...qData, country, options, categoryId: category };
    }).filter(Boolean);

    setQuestions(built.slice(0, length));
    startSession(category, mode, Math.min(length, built.length));
  }, []);

  useEffect(() => {
    if (mode === 'type' && inputRef.current && !revealed) {
      inputRef.current.focus();
    }
  }, [current, revealed, mode]);

  const normalizeAnswer = (str) => str.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ');

  const handleSubmitType = useCallback(() => {
    if (revealed || !typed.trim()) return;
    const question = questions[current];
    const norm = normalizeAnswer(typed);
    const correct = normalizeAnswer(question.answer);
    const isRight = norm === correct || correct.includes(norm) || norm.includes(correct.split(' ')[0]);
    setIsCorrect(isRight);
    setRevealed(true);
    recordAnswer(isRight, question, typed);
  }, [typed, revealed, questions, current]);

  const handleSelectMCQ = (option) => {
    if (revealed) return;
    const question = questions[current];
    const isRight = option === question.answer;
    setSelected(option);
    setIsCorrect(isRight);
    setRevealed(true);
    recordAnswer(isRight, question, option);
  };

  const handleNext = () => {
    const nextIdx = current + 1;
    if (nextIdx >= questions.length) {
      const session = endSession();
      navigate('/results', { state: { session } });
    } else {
      setCurrent(nextIdx);
      setSelected(null);
      setTyped('');
      setRevealed(false);
      setIsCorrect(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!revealed) handleSubmitType();
      else handleNext();
    }
  };

  if (!questions.length || !cat) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>🌍</div>
          <p style={{ color: 'var(--text-muted)' }}>Preparing questions...</p>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const progress = ((current + (revealed ? 1 : 0)) / questions.length) * 100;
  const streak = currentSession?.streak || 0;

  return (
    <div style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 6,
                background: mode === 'mcq' ? 'var(--blue-dim)' : 'var(--teal-dim)',
                color: mode === 'mcq' ? 'var(--blue)' : 'var(--teal)',
                fontSize: 11, fontWeight: 600,
              }}>
                {mode === 'mcq' ? 'CHOICE' : 'TYPE'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {streak >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}
                >
                  🔥 {streak}
                </motion.div>
              )}
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {current + 1}/{questions.length}
              </span>
            </div>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: cat.color, borderRadius: 2 }}
            />
          </div>
        </div>

        {/* Score */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 20,
        }}>
          <div style={{
            background: 'var(--success-dim)', border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--success)', fontWeight: 600,
          }}>
            ✓ {currentSession?.score || 0}
          </div>
          <div style={{
            background: 'var(--error-dim)', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--error)', fontWeight: 600,
          }}>
            ✗ {current - (currentSession?.score || 0)}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              marginBottom: 16,
            }}>
              {/* Display (flag or emoji) */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ fontSize: question.displayType === 'flag' ? 100 : 64, lineHeight: 1, display: 'inline-block' }}
                >
                  {question.display}
                </motion.div>
              </div>

              {/* Question text */}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 3vw, 24px)',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: 28,
                lineHeight: 1.3,
              }}>
                {question.question}
              </h2>

              {/* MCQ Options */}
              {mode === 'mcq' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {question.options.map((option, i) => {
                    const isSelected = selected === option;
                    const isAnswer = revealed && option === question.answer;
                    const isWrong = revealed && isSelected && !isCorrect;

                    let bg = 'var(--bg-secondary)';
                    let border = 'var(--border)';
                    let color = 'var(--text-primary)';

                    if (isAnswer) { bg = 'var(--success-dim)'; border = 'rgba(74,222,128,0.5)'; color = 'var(--success)'; }
                    if (isWrong) { bg = 'var(--error-dim)'; border = 'rgba(248,113,113,0.5)'; color = 'var(--error)'; }

                    return (
                      <motion.button
                        key={i}
                        whileHover={!revealed ? { scale: 1.02 } : {}}
                        whileTap={!revealed ? { scale: 0.98 } : {}}
                        onClick={() => handleSelectMCQ(option)}
                        style={{
                          background: bg, border: `1px solid ${border}`, color,
                          borderRadius: 10, padding: '14px 16px',
                          textAlign: 'left', fontSize: 14, fontWeight: 500,
                          cursor: revealed ? 'default' : 'pointer',
                          fontFamily: 'var(--font-body)',
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {isAnswer ? '✓' : isWrong ? '✗' : 'ABCD'[i]}
                        </span>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Type mode */}
              {mode === 'type' && (
                <div>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={typed}
                      onChange={(e) => !revealed && setTyped(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer..."
                      disabled={revealed}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: revealed
                          ? isCorrect ? 'var(--success-dim)' : 'var(--error-dim)'
                          : 'var(--bg-secondary)',
                        border: `1px solid ${revealed ? (isCorrect ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)') : 'var(--border-bright)'}`,
                        borderRadius: 10,
                        color: revealed ? (isCorrect ? 'var(--success)' : 'var(--error)') : 'var(--text-primary)',
                        fontSize: 16, fontFamily: 'var(--font-body)',
                        transition: 'all 0.2s',
                      }}
                    />
                  </div>
                  {!revealed && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitType}
                      disabled={!typed.trim()}
                      style={{
                        width: '100%', padding: '13px',
                        background: typed.trim() ? cat.color : 'var(--border)',
                        color: typed.trim() ? '#0d0f1a' : 'var(--text-muted)',
                        borderRadius: 10, fontSize: 15, fontWeight: 700,
                        fontFamily: 'var(--font-body)',
                        cursor: typed.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      Submit Answer
                    </motion.button>
                  )}
                  {revealed && (
                    <div style={{
                      padding: '12px 16px',
                      background: isCorrect ? 'var(--success-dim)' : 'var(--error-dim)',
                      border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                      borderRadius: 10,
                      fontSize: 14,
                      color: isCorrect ? 'var(--success)' : 'var(--error)',
                    }}>
                      {isCorrect
                        ? '✓ Correct!'
                        : `✗ Correct answer: ${question.answer}`
                      }
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback banner */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: isCorrect ? 'var(--success-dim)' : 'var(--error-dim)',
                    border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    borderRadius: 12, padding: '14px 20px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{isCorrect ? '🎉' : '📚'}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--error)', marginBottom: 2 }}>
                        {isCorrect ? (streak >= 3 ? `${streak} in a row! 🔥` : 'Correct!') : 'Incorrect'}
                      </div>
                      {!isCorrect && mode === 'mcq' && (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          The answer was: <strong>{question.answer}</strong>
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {question.country?.name} {question.country?.flag}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleNext}
                    style={{
                      padding: '8px 20px',
                      background: isCorrect ? 'var(--success)' : 'var(--error)',
                      color: '#fff',
                      borderRadius: 8, fontWeight: 600, fontSize: 14,
                      fontFamily: 'var(--font-body)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    {current + 1 >= questions.length ? 'See Results' : 'Next →'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Keyboard hint */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Press <kbd style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontFamily: 'var(--font-mono)' }}>Enter</kbd> to {revealed ? 'continue' : mode === 'type' ? 'submit' : ''}
        </p>
      </div>
    </div>
  );
}
