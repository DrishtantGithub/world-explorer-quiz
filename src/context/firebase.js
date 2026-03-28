import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDemoKeyPlaceholder",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "world-quiz-demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "world-quiz-demo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "world-quiz-demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://world-quiz-demo.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;
