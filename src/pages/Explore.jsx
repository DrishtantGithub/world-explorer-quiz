import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { COUNTRIES, QUIZ_CATEGORIES } from '../data/countries';

const CONTINENTS = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

export default function Explore() {
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('All');
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let list = COUNTRIES;
    if (continent !== 'All') list = list.filter(c => c.continent === continent);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'population') return b.population - a.population;
      if (sortBy === 'capital') return a.capital.localeCompare(b.capital);
      return 0;
    });
  }, [search, continent, sortBy]);

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28 }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
            Explore Countries
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Browse all {COUNTRIES.length} countries and their facts
          </p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search countries, capitals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 40px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-primary)', fontSize: 14,
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text-primary)', fontSize: 14,
              fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}
          >
            <option value="name">Sort: A–Z</option>
            <option value="population">Sort: Population</option>
            <option value="capital">Sort: Capital</option>
          </select>
        </div>

        {/* Continent filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CONTINENTS.map(c => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.96 }}
              onClick={() => setContinent(c)}
              style={{
                padding: '6px 14px',
                background: continent === c ? 'var(--gold-dim)' : 'var(--bg-card)',
                border: `1px solid ${continent === c ? 'var(--gold)' : 'var(--border)'}`,
                color: continent === c ? 'var(--gold)' : 'var(--text-secondary)',
                borderRadius: 8, fontSize: 13, fontWeight: continent === c ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}
            >
              {c}
            </motion.button>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {filtered.length} countries
        </p>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selected ? '1fr 360px' : '1fr',
          gap: 16,
          alignItems: 'start',
        }}>
          {/* Country list */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
          }}>
            {filtered.map((country, i) => (
              <motion.div
                key={country.code}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                whileHover={{ y: -2 }}
                onClick={() => setSelected(selected?.code === country.code ? null : country)}
                style={{
                  background: selected?.code === country.code ? 'var(--gold-dim)' : 'var(--bg-card)',
                  border: `1px solid ${selected?.code === country.code ? 'rgba(232,197,71,0.4)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '14px 16px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{country.flag}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {country.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {country.capital}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'sticky', top: 80,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '28px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setSelected(null)}
                style={{
                  float: 'right', background: 'none', color: 'var(--text-muted)',
                  fontSize: 18, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                ✕
              </button>

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 72, marginBottom: 8 }}>{selected.flag}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                  {selected.name}
                </h2>
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {selected.code}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🏛️', label: 'Capital', value: selected.capital },
                  { icon: '💰', label: 'Currency', value: `${selected.currency} (${selected.currencyCode})` },
                  { icon: '🌍', label: 'Continent', value: selected.continent },
                  { icon: '🗺️', label: 'Region', value: selected.subregion },
                  { icon: '👥', label: 'Population', value: new Intl.NumberFormat().format(selected.population) },
                  { icon: '🗣️', label: 'Languages', value: selected.languages.join(', ') },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
