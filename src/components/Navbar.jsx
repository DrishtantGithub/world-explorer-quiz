import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../context/authStore';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/play', label: 'Play', icon: '🎮' },
  { to: '/multiplayer', label: 'MP', icon: '👥' },
  { to: '/dashboard', label: 'Stats', icon: '📊' },
  { to: '/leaderboard', label: 'Board', icon: '🏆' },
  { to: '/map', label: 'Map', icon: '🗺️' },
  { to: '/explore', label: 'Explore', icon: '🌍' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logoutUser } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      background: scrolled ? 'rgba(13,15,26,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--gold-dim)',
            border: '1px solid var(--gold)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🌐</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}>World<span style={{ color: 'var(--gold)' }}>Quiz</span></span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {links.map(link => {
            const active = location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link key={link.to} to={link.to}>
                <div style={{
                  position: 'relative',
                  padding: '6px 12px',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  background: active ? 'var(--gold-dim)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{ fontSize: 14 }}>{link.icon}</span>
                  <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute', inset: 0,
                        border: '1px solid rgba(232,197,71,0.3)',
                        borderRadius: 8,
                      }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          {user ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              👤 {user.displayName?.split(' ')[0] || user.email}
            </motion.button>
          ) : (
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--gold)',
                  color: '#0d0f1a',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Login
              </motion.button>
            </Link>
          )}

          {/* Dropdown menu */}
          {user && showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 8,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                minWidth: 180,
                overflow: 'hidden',
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                📊 My Dashboard
              </button>
              <button
                onClick={() => {
                  navigate('/leaderboard');
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--border)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--error)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                }}
              >
                🚪 Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
