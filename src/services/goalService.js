// ============================================
// !doneyet — Goal Service (Offline-First)
// ============================================

import { isFirebaseConfigured, db } from '../config/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { getToday } from './streakService'

/**
 * Record a solved question for today
 */
export async function recordSolvedQuestion(userId, questionId, topicName) {
  if (!isFirebaseConfigured || !userId) return
  try {
    const today = getToday()
    const ref = doc(db, 'users', userId, 'dailyLogs', today)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const data = snap.data()
      const questions = data.questions || []
      questions.push({ questionId, topicName, solvedAt: new Date().toISOString() })
      await setDoc(ref, { ...data, completed: questions.length, questions }, { merge: true })
    } else {
      await setDoc(ref, {
        date: today,
        target: 3,
        completed: 1,
        questions: [{ questionId, topicName, solvedAt: new Date().toISOString() }],
        createdAt: serverTimestamp(),
      })
    }
  } catch (err) {
    console.warn('Failed to record solved question:', err)
  }
}

/**
 * Get today's progress
 */
export async function getTodayProgress(userId) {
  if (!isFirebaseConfigured || !userId) return { target: 3, completed: 0, questions: [] }
  try {
    const today = getToday()
    const ref = doc(db, 'users', userId, 'dailyLogs', today)
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data()
    return { target: 3, completed: 0, questions: [] }
  } catch (err) {
    console.warn('Failed to get today progress:', err)
    return { target: 3, completed: 0, questions: [] }
  }
}

/**
 * Check if daily goal is met
 */
export async function checkDailyGoal(userId, dailyGoal = 3) {
  const progress = await getTodayProgress(userId)
  return {
    target: dailyGoal,
    completed: progress.completed,
    met: progress.completed >= dailyGoal,
  }
}

/**
 * Calculate streak from daily logs
 */
export async function getStreak(userId) {
  // For now, streak is managed via the streak service and user profile
  // This is a placeholder for Firestore-based streak calculation
  return 0
}

/**
 * Update streak on user profile
 */
export async function updateStreak(userId, streak) {
  if (!isFirebaseConfigured || !userId) return
  try {
    const ref = doc(db, 'users', userId)
    await setDoc(ref, { streak, updatedAt: serverTimestamp() }, { merge: true })
  } catch (err) {
    console.warn('Failed to update streak:', err)
  }
}
