# !doneyet — DSA Practice Tracker

> Your DSA journey isn't done yet. 🔥

A modern, full-stack DSA practice tracker with 456+ curated problems, social features, and an AI-powered study buddy.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

## ✨ Features

- **456+ DSA Problems** — Curated across 18 topics (Arrays, DP, Graphs, Trees, etc.)
- **Google & GitHub Login** — Secure OAuth authentication via Firebase
- **Progress Tracking** — Mark problems as done, add notes, bookmark favorites
- **Leaderboard** — Compete with friends and see who solves the most
- **Friend System** — Add friends, send requests, track each other's progress
- **Ghost Mode** 👻 — Go invisible on the leaderboard while you study
- **"Who Cares" AI Bot** 🤖 — Your friendly AI study buddy powered by Gemini
  - Tracks your daily goals
  - Recommends what to solve next
  - Sends email reminders when you miss goals
- **Dark Mode** — Beautiful dark-first design with glassmorphism UI
- **Offline Support** — Works without internet thanks to Firestore persistence

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Framer Motion |
| Styling | Custom CSS (glassmorphism design system) |
| Auth | Firebase Authentication (Google + GitHub OAuth) |
| Database | Cloud Firestore |
| AI | Google Gemini API |
| Email | EmailJS |
| State | Zustand |
| Icons | Lucide React |
| Routing | React Router v7 |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project ([create one here](https://console.firebase.google.com/))
- Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/doneyet.git
   cd doneyet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase config, Gemini API key, and EmailJS credentials in `.env`.

4. **Firebase Setup**
   - Enable **Google** and **GitHub** sign-in methods in Firebase Console → Authentication
   - Create a **Firestore database** in test mode
   - For GitHub OAuth, create an OAuth app at [github.com/settings/developers](https://github.com/settings/developers)

5. **Start the dev server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
src/
├── config/          # Firebase configuration
├── contexts/        # React contexts (Auth)
├── store/           # Zustand state management
├── styles/          # CSS design system (5 files)
├── pages/           # Page components
│   ├── LoginPage
│   ├── SetupProfilePage
│   ├── DashboardPage
│   ├── TopicPage
│   ├── LeaderboardPage
│   ├── FriendsPage
│   └── ChatPage
├── components/      # Reusable components
│   ├── Sidebar
│   ├── TopBar
│   ├── TopicCard
│   ├── ProgressRing
│   ├── ChatWidget
│   └── ...
├── services/        # Backend services
│   ├── firestoreService
│   ├── friendService
│   ├── chatService
│   ├── goalService
│   └── emailService
└── App.jsx          # Root component with routing
```

## 📝 License

MIT

---

Built with 💜 and lots of ☕
