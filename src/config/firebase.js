// ============================================
// !doneyet — Firebase Configuration
// ============================================
// 
// SETUP: Create a Firebase project, then add your config to .env
// See .env.example for required values.
// The app works in OFFLINE MODE without Firebase — all data saved to localStorage.
// When Firebase is configured, data syncs to Firestore automatically.

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  getFirestore,
  enableIndexedDbPersistence,
} from 'firebase/firestore'

// ── Firebase Config ──
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

// Check if Firebase is properly configured
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
)

// ── Initialize Firebase ──
let app, auth, db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Enable offline persistence
  if (isFirebaseConfigured) {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: multiple tabs open')
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence: browser not supported')
      }
    })
  }
} catch (e) {
  console.warn('Firebase init error:', e)
}

export { auth, db }

// ── Auth Providers ──
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

const githubProvider = new GithubAuthProvider()
githubProvider.addScope('read:user')
githubProvider.addScope('user:email')

// ── Auth Helper Functions ──
export const signInWithGoogle = () => {
  if (!isFirebaseConfigured) {
    return Promise.reject({ code: 'auth/invalid-api-key', message: 'Firebase not configured' })
  }
  return signInWithPopup(auth, googleProvider)
}

export const signInWithGithub = () => {
  if (!isFirebaseConfigured) {
    return Promise.reject({ code: 'auth/invalid-api-key', message: 'Firebase not configured' })
  }
  return signInWithPopup(auth, githubProvider)
}

export const signInAsGuest = () => {
  if (!isFirebaseConfigured) {
    return Promise.reject({ code: 'auth/invalid-api-key', message: 'Firebase not configured' })
  }
  return firebaseSignInAnonymously(auth)
}

export const logOut = () => {
  if (auth) return signOut(auth)
  return Promise.resolve()
}

export const onAuthChange = (callback) => {
  if (auth) return onAuthStateChanged(auth, callback)
  // If Firebase not initialized, call with null user immediately
  callback(null)
  return () => {} // noop unsubscribe
}

export default app
