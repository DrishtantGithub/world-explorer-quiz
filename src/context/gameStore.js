import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultStats = {
  totalQuizzes: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  bestStreak: 0,
  categoryStats: {},
  recentSessions: [],
  achievements: [],
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      stats: defaultStats,
      currentSession: null,

      startSession: (category, mode, total) => {
        set({
          currentSession: {
            category,
            mode,
            total,
            positiveScore: 0,
            negativeScore: 0,
            score: 0, // For backward compatibility
            streak: 0,
            maxStreak: 0,
            answers: [],
            startTime: Date.now(),
          },
        });
      },

      recordAnswer: (isCorrect, question, userAnswer) => {
        const session = get().currentSession;
        if (!session) return;

        const newStreak = isCorrect ? session.streak + 1 : 0;
        const newMaxStreak = Math.max(session.maxStreak, newStreak);
        const newPositiveScore = isCorrect ? session.positiveScore + 1 : session.positiveScore;
        const newNegativeScore = isCorrect ? session.negativeScore : session.negativeScore + 1;

        set({
          currentSession: {
            ...session,
            positiveScore: newPositiveScore,
            negativeScore: newNegativeScore,
            score: newPositiveScore, // For backward compatibility
            streak: newStreak,
            maxStreak: newMaxStreak,
            answers: [
              ...session.answers,
              {
                question: question.question,
                correct: question.answer,
                given: userAnswer,
                isCorrect,
                country: question.country?.name,
                flag: question.country?.flag,
              },
            ],
          },
        });
      },

      endSession: () => {
        const session = get().currentSession;
        if (!session) return;

        const { stats } = get();
        const duration = Math.round((Date.now() - session.startTime) / 1000);
        const accuracy = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;

        const categoryStats = { ...stats.categoryStats };
        if (!categoryStats[session.category]) {
          categoryStats[session.category] = { played: 0, correct: 0, total: 0, bestAccuracy: 0 };
        }
        categoryStats[session.category].played += 1;
        categoryStats[session.category].correct += session.score;
        categoryStats[session.category].total += session.total;
        categoryStats[session.category].bestAccuracy = Math.max(
          categoryStats[session.category].bestAccuracy,
          accuracy
        );

        const sessionRecord = {
          id: Date.now(),
          category: session.category,
          mode: session.mode,
          score: session.score,
          total: session.total,
          accuracy,
          streak: session.maxStreak,
          duration,
          date: new Date().toISOString(),
          answers: session.answers,
        };

        const recentSessions = [sessionRecord, ...stats.recentSessions].slice(0, 50);

        // Check achievements
        const achievements = [...(stats.achievements || [])];
        const checkAchievement = (id, condition) => {
          if (condition && !achievements.includes(id)) achievements.push(id);
        };
        checkAchievement('first_quiz', true);
        checkAchievement('perfect_score', accuracy === 100);
        checkAchievement('streak_5', session.maxStreak >= 5);
        checkAchievement('streak_10', session.maxStreak >= 10);
        checkAchievement('streak_20', session.maxStreak >= 20);
        checkAchievement('century', (stats.totalQuestions + session.total) >= 100);
        checkAchievement('all_categories', Object.keys(categoryStats).length >= 6);
        checkAchievement('globe_trotter', (stats.totalQuizzes + 1) >= 10);

        set({
          stats: {
            ...stats,
            totalQuizzes: stats.totalQuizzes + 1,
            totalQuestions: stats.totalQuestions + session.total,
            totalCorrect: stats.totalCorrect + session.score,
            bestStreak: Math.max(stats.bestStreak, session.maxStreak),
            categoryStats,
            recentSessions,
            achievements,
          },
          currentSession: null,
        });

        return sessionRecord;
      },

      resetStats: () => {
        set({ stats: defaultStats, currentSession: null });
      },
    }),
    {
      name: 'world-quiz-storage',
    }
  )
);

export const ACHIEVEMENTS = [
  { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: '🎯' },
  { id: 'perfect_score', name: 'Perfectionist', desc: 'Score 100% on a quiz', icon: '💯' },
  { id: 'streak_5', name: 'On a Roll', desc: 'Get a 5-answer streak', icon: '🔥' },
  { id: 'streak_10', name: 'Hot Streak', desc: 'Get a 10-answer streak', icon: '⚡' },
  { id: 'streak_20', name: 'Unstoppable', desc: 'Get a 20-answer streak', icon: '🌟' },
  { id: 'century', name: 'Century Club', desc: 'Answer 100 questions total', icon: '💎' },
  { id: 'all_categories', name: 'All-Rounder', desc: 'Play all 6 categories', icon: '🌍' },
  { id: 'globe_trotter', name: 'Globe Trotter', desc: 'Complete 10 quizzes', icon: '✈️' },
];
