import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/play', label: 'Play', icon: '🎮' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/explore', label: 'Explore', icon: '🌍' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
                  padding: '6px 14px',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  background: active ? 'var(--gold-dim)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{ fontSize: 13 }}>{link.icon}</span>
                  <span style={{ display: window.innerWidth < 500 ? 'none' : 'inline' }}>{link.label}</span>
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
      </div>
    </header>
  );
}
