import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QUIZ_CATEGORIES, COUNTRIES } from '../data/countries';

const REGIONS = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const LENGTHS = [10, 20, 30, 50];

export default function QuizConfig() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('mcq');
  const [length, setLength] = useState(20);
  const [region, setRegion] = useState('All');

  const cat = QUIZ_CATEGORIES.find(c => c.id === category);
  if (!cat) return <div>Category not found</div>;

  const availableCount = region === 'All'
    ? COUNTRIES.length
    : COUNTRIES.filter(c => c.continent === region || c.subregion?.includes(region)).length;

  const handleStart = () => {
    navigate('/quiz', {
      state: { category, mode, length: Math.min(length, availableCount), region }
    });
  };

  const OptionButton = ({ selected, onClick, children }) => (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: 10,
        background: selected ? cat.color + '20' : 'var(--bg-card)',
        border: `1px solid ${selected ? cat.color : 'var(--border)'}`,
        color: selected ? cat.color : 'var(--text-secondary)',
        fontWeight: selected ? 600 : 400,
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </motion.button>
  );

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/play" style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← All Categories
          </Link>

          {/* Header */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 160, height: 160, borderRadius: '50%',
              background: cat.color, opacity: 0.06, filter: 'blur(40px)',
            }} />
            <div style={{ fontSize: 48, marginBottom: 12 }}>{cat.icon}</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              {cat.name} Quiz
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
          </div>

          {/* Config options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Quiz Mode */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}>
              <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>Quiz Mode</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                How do you want to answer?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <OptionButton selected={mode === 'mcq'} onClick={() => setMode('mcq')}>
                  🔤 Multiple Choice
                </OptionButton>
                <OptionButton selected={mode === 'type'} onClick={() => setMode('type')}>
                  ⌨️ Type Answer
                </OptionButton>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                {mode === 'mcq'
                  ? 'Pick the correct answer from 4 options'
                  : 'Type the answer yourself — spelling counts (mostly)!'
                }
              </p>
            </div>

            {/* Length */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}>
              <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>Number of Questions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                {availableCount} countries available for this region
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {LENGTHS.map(l => (
                  <OptionButton
                    key={l}
                    selected={length === l}
                    onClick={() => setLength(l)}
                  >
                    {l} Qs
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Region */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}>
              <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>Region</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                Focus on a specific part of the world
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {REGIONS.map(r => (
                  <OptionButton key={r} selected={region === r} onClick={() => setRegion(r)}>
                    {r}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Start */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              style={{
                padding: '16px',
                borderRadius: 14,
                background: cat.color,
                color: '#0d0f1a',
                fontWeight: 700, fontSize: 16,
                fontFamily: 'var(--font-body)',
                boxShadow: `0 0 40px ${cat.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              Start Quiz — {Math.min(length, availableCount)} Questions
              <span style={{ fontSize: 20 }}>🚀</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
