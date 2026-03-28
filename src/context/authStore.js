import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      loading: true,
      error: null,

      // Register new user
      registerUser: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null });
          const result = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update display name
          await updateProfile(result.user, { displayName });
          
          // Create user profile in Firestore
          await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email,
            displayName,
            createdAt: new Date().toISOString(),
            stats: {
              totalQuizzes: 0,
              totalQuestions: 0,
              totalCorrect: 0,
              bestStreak: 0,
              categoryStats: {},
            },
            rank: 0,
          });

          set({ user: result.user });
          return result.user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      // Login user
      loginUser: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const result = await signInWithEmailAndPassword(auth, email, password);
          
          // Fetch user profile
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          set({ 
            user: result.user,
            userProfile: userDoc.data(),
          });
          
          return result.user;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      // Logout user
      logoutUser: async () => {
        try {
          await signOut(auth);
          set({ user: null, userProfile: null });
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // Update user profile stats
      updateUserStats: async (stats) => {
        const user = get().user;
        if (!user) return;

        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { stats });
          set({ userProfile: { ...get().userProfile, stats } });
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // Set user info
      setUser: (user) => set({ user, loading: false }),
      setUserProfile: (profile) => set({ userProfile: profile }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
