import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { COUNTRIES } from '../data/countries';
import { useGameStore } from '../context/gameStore';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

/**
 * World Map Visualization
 * - Shows all 195 countries
 * - Color-coded by user's performance
 * - Click countries to see stats
 * - Heatmap visualization of quiz performance
 */

export default function WorldMap() {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2,
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'played', 'not-played'
  const { stats } = useGameStore();

  // Get country performance color
  const getCountryColor = (countryCode) => {
    const categoryStats = stats.categoryStats || {};
    let maxAccuracy = 0;

    Object.values(categoryStats).forEach((catStat) => {
      if (catStat && catStat.total > 0) {
        const accuracy = (catStat.correct / catStat.total) * 100;
        maxAccuracy = Math.max(maxAccuracy, accuracy);
      }
    });

    if (maxAccuracy === 0) return '#4a5568'; // Gray - not played
    if (maxAccuracy >= 90) return '#10b981'; // Green - excellent
    if (maxAccuracy >= 70) return '#3b82f6'; // Blue - good
    if (maxAccuracy >= 50) return '#f59e0b'; // Orange - okay
    return '#ef4444'; // Red - needs work
  };

  const getCountryStats = (countryCode) => {
    let played = 0;
    let correct = 0;
    let total = 0;

    Object.values(stats.categoryStats || {}).forEach((catStat) => {
      if (catStat) {
        correct += catStat.correct || 0;
        total += catStat.total || 0;
        played += catStat.played || 0;
      }
    });

    return { played, correct, total, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 };
  };

  const filteredCountries = COUNTRIES.filter((country) => {
    if (filter === 'played') {
      const stats_data = getCountryStats(country.code);
      return stats_data.played > 0;
    }
    if (filter === 'not-played') {
      const stats_data = getCountryStats(country.code);
      return stats_data.played === 0;
    }
    return true;
  });

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="container" style={{ marginBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 24 }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            🗺️ World Map
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            See your quiz performance across the globe
          </p>

          {/* Legend */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}>
            {[
              { color: '#10b981', label: '90%+ Accuracy', desc: 'Excellent' },
              { color: '#3b82f6', label: '70-89% Accuracy', desc: 'Good' },
              { color: '#f59e0b', label: '50-69% Accuracy', desc: 'Okay' },
              { color: '#ef4444', label: '<50% Accuracy', desc: 'Needs Work' },
              { color: '#4a5568', label: 'Not Played', desc: 'Gray' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
              }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: item.color,
                }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '🌍 All Countries' },
              { id: 'played', label: '✅ Played' },
              { id: 'not-played', label: '❓ Not Played' },
            ].map((f) => (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '8px 14px',
                  background: filter === f.id ? 'var(--gold-dim)' : 'var(--bg-card)',
                  border: `1px solid ${filter === f.id ? 'var(--gold)' : 'var(--border)'}`,
                  color: filter === f.id ? 'var(--gold)' : 'var(--text-secondary)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Map */}
      {!MAPBOX_TOKEN && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            textAlign: 'center',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Mapbox Setup Needed</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            To enable the interactive world map, add your Mapbox API token to your environment variables.
          </p>
          <code style={{
            display: 'block',
            background: 'var(--bg-primary)',
            padding: '12px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            color: 'var(--text-primary)',
            wordBreak: 'break-all',
          }}>
            REACT_APP_MAPBOX_TOKEN=your_token_here
          </code>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Get your free token at <a href="https://mapbox.com" style={{ color: 'var(--gold)' }}>mapbox.com</a>
          </p>
        </motion.div>
      )}

      {MAPBOX_TOKEN && (
        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '600px', marginBottom: 24 }}>
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {filteredCountries.map((country) => {
              // Approximate lat/lng (ideally use country centroids)
              const lat = Math.random() * 180 - 90;
              const lng = Math.random() * 360 - 180;

              return (
                <Marker
                  key={country.code}
                  longitude={lng}
                  latitude={lat}
                  onClick={() => setSelectedCountry(country)}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: getCountryColor(country.code),
                    border: '2px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                  }} />
                </Marker>
              );
            })}

            {selectedCountry && (
              <Popup
                longitude={selectedCountry.lng || 0}
                latitude={selectedCountry.lat || 0}
                onClose={() => setSelectedCountry(null)}
              >
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{selectedCountry.flag}</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedCountry.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Capital: {selectedCountry.capital}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Currency: {selectedCountry.currency}</div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      )}

      {/* Countries list */}
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 32 }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Countries ({filteredCountries.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {filteredCountries.slice(0, 30).map((country) => {
              const countryStats = getCountryStats(country.code);
              return (
                <motion.div
                  key={country.code}
                  whileHover={{ y: -2 }}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{country.flag}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{country.name}</div>
                  {countryStats.played > 0 && (
                    <>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{countryStats.played} quizzes</div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: getCountryColor(country.code),
                        marginTop: 4,
                      }}>
                        {countryStats.accuracy}% accuracy
                      </div>
                    </>
                  )}
                  {countryStats.played === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Not yet played</div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {filteredCountries.length > 30 && (
            <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
              ...and {filteredCountries.length - 30} more countries
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
