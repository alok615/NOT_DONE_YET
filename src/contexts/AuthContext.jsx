// ============================================
// !doneyet — Auth Context (Offline-First, Zero Errors)
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  onAuthChange,
  signInWithGoogle,
  signInWithGithub,
  signInAsGuest,
  logOut,
  db,
  isFirebaseConfigured,
} from '../config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ── Offline profile helpers ──
function getOfflineProfile() {
  try {
    const saved = localStorage.getItem('doneyet_offline_profile')
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveOfflineProfile(profile) {
  try {
    localStorage.setItem('doneyet_offline_profile', JSON.stringify(profile))
  } catch (e) {
    console.warn('Failed to save offline profile:', e)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [offlineMode] = useState(!isFirebaseConfigured)

  // Listen for auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // OFFLINE MODE: Check localStorage for existing profile
      const offlineProfile = getOfflineProfile()
      if (offlineProfile) {
        setUser({
          uid: offlineProfile.id || 'offline',
          displayName: offlineProfile.displayName,
          email: offlineProfile.email,
          photoURL: offlineProfile.photoURL,
          isAnonymous: false,
        })
        setUserProfile(offlineProfile)
      }
      setLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 2000)
          )
          
          const profileSnap = await Promise.race([
            getDoc(profileRef),
            timeoutPromise
          ])

          if (profileSnap.exists()) {
            const profile = { id: firebaseUser.uid, ...profileSnap.data() }
            setUserProfile(profile)
            saveOfflineProfile(profile) // Cache for offline
          } else {
            setUserProfile(null)
          }
        } catch (err) {
          console.warn('Error fetching profile (or timed out):', err)
          const cached = getOfflineProfile()
          if (cached && cached.id === firebaseUser.uid) {
            setUserProfile(cached)
          } else {
            setUserProfile(null)
          }
        }
      } else {
        const offlineProfile = getOfflineProfile()
        if (offlineProfile && offlineProfile.id && offlineProfile.id.startsWith('offline_')) {
          setUser({
            uid: offlineProfile.id,
            displayName: offlineProfile.displayName,
            email: offlineProfile.email,
            photoURL: offlineProfile.photoURL,
            isAnonymous: true,
          })
          setUserProfile(offlineProfile)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ── LOGIN HANDLERS ──
  // When Firebase is configured: use real OAuth popups
  // When offline: create instant local session (no errors, no toasts)

  const loginWithGoogleHandler = useCallback(async () => {
    setAuthError(null)

    if (offlineMode) {
      // Instant offline login — NO error, NO popup
      const offlineUser = {
        uid: 'offline_google_' + Date.now(),
        displayName: 'User',
        email: null,
        photoURL: null,
        isAnonymous: false,
      }
      setUser(offlineUser)
      const existing = getOfflineProfile()
      if (existing) setUserProfile(existing)
      return offlineUser
    }

    try {
      const result = await signInWithGoogle()
      return result.user
    } catch (err) {
      console.error('Google sign-in error:', err)
      const msg = getAuthErrorMessage(err.code)
      if (msg) setAuthError(msg)
      throw err
    }
  }, [offlineMode])

  const loginWithGithubHandler = useCallback(async () => {
    setAuthError(null)

    if (offlineMode) {
      const offlineUser = {
        uid: 'offline_github_' + Date.now(),
        displayName: 'User',
        email: null,
        photoURL: null,
        isAnonymous: false,
      }
      setUser(offlineUser)
      const existing = getOfflineProfile()
      if (existing) setUserProfile(existing)
      return offlineUser
    }

    try {
      const result = await signInWithGithub()
      return result.user
    } catch (err) {
      console.error('GitHub sign-in error:', err)
      const msg = getAuthErrorMessage(err.code)
      if (msg) setAuthError(msg)
      throw err
    }
  }, [offlineMode])

  const loginAsGuestHandler = useCallback(async () => {
    setAuthError(null)

    if (offlineMode) {
      const offlineUser = {
        uid: 'offline_guest_' + Date.now(),
        displayName: 'Guest',
        email: null,
        photoURL: null,
        isAnonymous: true,
      }
      setUser(offlineUser)
      const existing = getOfflineProfile()
      if (existing) setUserProfile(existing)
      return offlineUser
    }

    try {
      const result = await signInAsGuest()
      return result.user
    } catch (err) {
      console.warn('Firebase Guest sign-in failed, falling back to local guest:', err)
      
      // Auto-fallback to local guest if Firebase fails
      const offlineUser = {
        uid: 'offline_guest_' + Date.now(),
        displayName: 'Guest',
        email: null,
        photoURL: null,
        isAnonymous: true,
      }
      setUser(offlineUser)
      const existing = getOfflineProfile()
      if (existing) setUserProfile(existing)
      return offlineUser
    }
  }, [offlineMode])

  // Sign out
  const logout = useCallback(async () => {
    try {
      if (!offlineMode) await logOut()
      setUser(null)
      setUserProfile(null)
      localStorage.removeItem('doneyet_offline_profile')
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }, [offlineMode])

  // Create user profile
  const createProfile = useCallback(async (profileData) => {
    if (!user) throw new Error('No authenticated user')

    const newProfile = {
      id: user.uid,
      uid: user.uid,
      username: profileData.username.toLowerCase(),
      displayName: profileData.displayName || user.displayName || profileData.username,
      email: user.email || null,
      photoURL: profileData.photoURL || user.photoURL || null,
      avatar: profileData.avatar || '😎',
      dailyGoalTarget: profileData.dailyGoalTarget || 3,
      solvedQuestions: [],
      bookmarks: [],
      streak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      dailyActivity: {},
      ghostMode: false,
      hasSeenOnboardingTour: false,
      lastSolvedQuestion: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (isFirebaseConfigured) {
      try {
        const profileRef = doc(db, 'users', user.uid)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 2000)
        )
        
        await Promise.race([
          setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
          timeoutPromise
        ])
      } catch (err) {
        console.warn('Firestore write failed (or timed out), using offline:', err)
      }
    }

    saveOfflineProfile(newProfile)
    setUserProfile(newProfile)
    return newProfile
  }, [user])

  // Update user profile
  const updateUserProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user')

    const updatedData = { ...updates, updatedAt: new Date().toISOString() }

    // 1. Optimistic Update: Write to localStorage and React state IMMEDIATELY to prevent race conditions
    const currentLocal = getOfflineProfile()
    const baseProfile = currentLocal ? currentLocal : userProfile
    const newProfile = { ...baseProfile, ...updatedData }
    
    saveOfflineProfile(newProfile)
    setUserProfile(newProfile)

    // 2. Background Sync: Send to Firestore without blocking the UI
    if (isFirebaseConfigured) {
      try {
        const profileRef = doc(db, 'users', user.uid)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 2000)
        )
        
        await Promise.race([
          updateDoc(profileRef, { ...updatedData, updatedAt: serverTimestamp() }),
          timeoutPromise
        ])
      } catch (err) {
        console.warn('Firestore update failed (or timed out):', err)
      }
    }
  }, [user, userProfile])

  // Check if username is available
  const checkUsername = useCallback(async (username) => {
    if (!username || username.length < 3) return false
    if (!isFirebaseConfigured) return true // Always available offline

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', username.toLowerCase()))
      
      // Add a 2-second timeout to prevent hanging if Firestore isn't fully set up
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 2000)
      )
      
      const snapshot = await Promise.race([
        getDocs(q),
        timeoutPromise
      ])
      
      return snapshot.empty
    } catch (err) {
      console.warn('Username check failed (or timed out):', err)
      return true // If it fails, let them proceed
    }
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    authError,
    offlineMode,
    isAuthenticated: !!user,
    hasProfile: !!userProfile,
    isGuest: user?.isAnonymous || false,
    loginWithGoogle: loginWithGoogleHandler,
    loginWithGithub: loginWithGithubHandler,
    loginAsGuest: loginAsGuestHandler,
    logout,
    createProfile,
    updateProfile: updateUserProfile,
    checkUsername,
    clearError: () => setAuthError(null),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Friendly Error Messages ──
function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Try again when ready.'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups for this site.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.'
    case 'auth/cancelled-popup-request':
      return null // Silent
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.'
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return null // Silent in offline mode — handled gracefully
    case 'auth/unauthorized-domain':
      return 'Add localhost to Firebase Auth → Settings → Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Enable this sign-in method in Firebase Console → Authentication → Sign-in method.'
    case 'auth/internal-error':
      return 'Firebase connection error. Check your internet and Firebase config.'
    default:
      if (!code) return null
      console.warn('Auth error:', code)
      return `Authentication error (${code}). Please try again.`
  }
}

export default AuthContext
