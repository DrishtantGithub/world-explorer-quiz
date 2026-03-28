import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import CategorySelect from './pages/CategorySelect';
import QuizConfig from './pages/QuizConfig';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import Multiplayer from './pages/Multiplayer';
import WorldMap from './pages/WorldMap';
import Navbar from './components/Navbar';
import { auth } from './context/firebase';
import { useAuthStore } from './context/authStore';

export default function App() {
  const { setUser, setUserProfile } = useAuthStore();

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Fetch user profile from Firestore in your authStore
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/play" element={<CategorySelect />} />
            <Route path="/play/:category" element={<QuizConfig />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/multiplayer" element={<Multiplayer />} />
            <Route path="/map" element={<WorldMap />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
