# 🌍 World Explorer Quiz - Setup Guide

## New Features Added

### 1. **Login & Authentication** 🔐
- Firebase Authentication with email/password
- Sign up and login pages
- User profiles with persistent stats
- Logout functionality in navbar

### 2. **Database** 💾
- Firestore for user profiles and stats
- Real-time multiplayer game data
- Leaderboard rankings
- All data synced across devices

### 3. **Leaderboard** 🏆
- Global rankings by total correct answers
- Category-specific leaderboards
- Live accuracy percentages
- Top 50 players displayed

### 4. **Multiplayer Quiz** 👥
- Real-time multiplayer game rooms
- Create games or join existing ones
- Live score tracking
- Competitive gameplay with results

### 5. **World Map Visualization** 🗺️
- Interactive Mapbox integration
- Color-coded countries by performance
- Country details on click
- Heatmap of quiz achievements
- Filter by played/not played countries

---

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Firebase Setup

1. **Create a Firebase Project:**
   - Go to [firebase.google.com](https://firebase.google.com)
   - Click "Get Started" or "Go to console"
   - Create a new project

2. **Enable Authentication:**
   - In Firebase Console → Authentication
   - Click "Get Started"
   - Enable "Email/Password" provider
   - Click Save

3. **Enable Firestore Database:**
   - In Firebase Console → Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose a location (closest to you)

4. **Get Your Config:**
   - Go to Project Settings (⚙️ icon)
   - Copy "Firebase SDK snippet" from "Web" tab
   - Extract these values:
     - apiKey
     - authDomain
     - projectId
     - storageBucket
     - messagingSenderId
     - appId
     - databaseURL (in Realtime Database section)

5. **Create .env.local file:**
   ```bash
   cp .env.example .env.local
   ```

6. **Add your Firebase credentials to .env.local:**
   ```
   REACT_APP_FIREBASE_API_KEY=your_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_DATABASE_URL=your_database_url
   ```

7. **Set Firestore Rules:**
   In Firebase Console → Firestore Database → Rules, replace with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read: if request.auth.uid != null;
         allow write: if request.auth.uid == uid;
       }
       match /multiplayer_games/{gameId} {
         allow read: if request.auth.uid != null;
         allow write: if request.auth.uid != null;
       }
     }
   }
   ```

### Step 3: Mapbox Setup (Optional)

1. **Create Mapbox Account:**
   - Go to [mapbox.com](https://mapbox.com)
   - Sign up for free
   - Go to Account → Tokens
   - Copy your public access token

2. **Add to .env.local:**
   ```
   REACT_APP_MAPBOX_TOKEN=your_public_token
   ```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` and enjoy! 🚀

---

## Features Overview

### 🔐 Login Page (`/login`)
- Create new account with email and password
- Sign in to existing account
- Continue as guest option
- Profile stored in Firestore

### 📊 Leaderboard (`/leaderboard`)
- View global rankings
- Filter by category
- See your rank and stats
- Real-time updates

### 👥 Multiplayer (`/multiplayer`)
- Create game rooms
- Real-time player updates
- Live score tracking
- Results and rankings
- Uses Firestore for persistence

### 🗺️ World Map (`/map`)
- Interactive globe visualization
- Color-coded performance (green = 90%+, red = <50%)
- Click countries for details
- Filter: all/played/not-played
- Requires Mapbox token

### 📱 Updated Navigation
- New navbar with all features
- User profile dropdown when logged in
- Logout functionality
- Responsive design

---

## Database Schema

### Users Collection
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  displayName: "Player Name",
  createdAt: "2026-03-29T...",
  stats: {
    totalQuizzes: 10,
    totalQuestions: 200,
    totalCorrect: 160,
    bestStreak: 15,
    categoryStats: {
      flags: { played: 5, correct: 90, total: 100, bestAccuracy: 90 }
    }
  }
}
```

### Multiplayer Games Collection
```javascript
{
  category: "flags",
  status: "active", // waiting, active, finished
  maxPlayers: 4,
  currentPlayers: 3,
  questions: "[...]",
  currentQuestion: 5,
  createdAt: "2026-03-29T...",
  createdBy: "user_id",
  players: {
    user_id: {
      uid: "user_id",
      name: "Player Name",
      score: 8,
      answers: [...]
    }
  }
}
```

---

## Troubleshooting

### "Firebase not initialized"
- Check your .env.local file exists
- Reload the page (`Ctrl+R` or `Cmd+R`)
- Check browser console for errors

### Leaderboard shows no data
- Make sure Firestore is enabled
- Verify security rules are set correctly
- Play a quiz to create user profile

### Map doesn't show
- Add Mapbox token to .env.local
- Verify token is public, not secret
- Check browser console for errors

### Multiplayer doesn't work
- Enable Realtime Database in Firebase (alternative: currently using Firestore)
- Check both players are logged in
- Verify internet connection

---

## Security Notes

- ⚠️ Never commit .env.local to git
- Use environment variables in production
- Firebase rules should restrict user data access
- Mapbox token is public-safe (already limited by domain)

---

## Next Steps

1. ✅ Setup Firebase and Mapbox tokens
2. ✅ Test login/signup functionality
3. ✅ Play a quiz to create user profile
4. ✅ Check leaderboard and multiplayer
5. ✅ Explore the world map
6. ✅ Deploy to production (Firebase Hosting recommended)

**Happy quizzing! 🌍**
