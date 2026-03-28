import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../context/authStore';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginUser, registerUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await registerUser(email, password, displayName);
      } else {
        await loginUser(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 64,
      paddingBottom: 40,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '40px 32px',
        }}
      >
        {/* Header */}
        <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56,
              background: 'var(--gold-dim)',
              border: '1px solid var(--gold)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto',
            }}>
              🌐
            </div>
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
          }}>
            {isSignUp ? 'Join the Quest' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isSignUp
              ? 'Create an account to track your world knowledge'
              : 'Sign in to continue your journey'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form {...fadeUp(0.1)} onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          {/* Display name (sign up only) */}
          {isSignUp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ marginBottom: 16, overflow: 'hidden' }}
            >
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
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
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </motion.div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--error-dim)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 13,
                color: 'var(--error)',
                marginBottom: 16,
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
            type="submit"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </motion.button>
        </motion.form>

        {/* Toggle sign up / login */}
        <motion.div {...fadeUp(0.2)} style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                fontFamily: 'var(--font-body)',
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>

        {/* Continue as guest */}
        <motion.div {...fadeUp(0.3)} style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Link to="/">
            <button
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '12px 20px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--gold)';
                e.target.style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              Continue as Guest
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
