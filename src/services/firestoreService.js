// ============================================
// !doneyet — Firestore Service (Offline-First)
// ============================================
// All operations gracefully handle missing Firebase config.

import { db, isFirebaseConfigured } from '../config/firebase'
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
  updateDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { getToday } from './streakService'

/**
 * Save user progress for a specific topic
 */
export async function saveUserProgress(userId, contentIndex, questionData) {
  if (!isFirebaseConfigured || !userId) return
  try {
    const ref = doc(db, 'users', userId, 'progress', String(contentIndex))
    await setDoc(ref, { ...questionData, updatedAt: serverTimestamp() }, { merge: true })
  } catch (err) {
    console.warn('Failed to save progress:', err)
  }
}

/**
 * Load all progress for a user
 */
export async function loadUserProgress(userId) {
  if (!isFirebaseConfigured || !userId) return {}
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'progress'))
    const progress = {}
    snapshot.docs.forEach(doc => {
      progress[doc.id] = doc.data()
    })
    return progress
  } catch (err) {
    console.warn('Failed to load progress:', err)
    return {}
  }
}

/**
 * Batch sync all progress data to Firestore
 */
export async function syncProgressToFirestore(userId, data) {
  if (!isFirebaseConfigured || !userId || !data) return
  try {
    const batch = writeBatch(db)
    data.data.content.forEach((topic, index) => {
      const ref = doc(db, 'users', userId, 'progress', String(index))
      const questions = {}
      topic.categoryList.forEach((cat, ci) => {
        cat.questionList.forEach((q, qi) => {
          if (q.isDone || q.isBookmarked || q.userNotes) {
            questions[`${ci}_${qi}`] = {
              isDone: q.isDone || false,
              isBookmarked: q.isBookmarked || false,
              userNotes: q.userNotes || '',
              solveDate: q.solveDate || null,
            }
          }
        })
      })
      if (Object.keys(questions).length > 0) {
        batch.set(ref, { questions, updatedAt: serverTimestamp() }, { merge: true })
      }
    })
    await batch.commit()
  } catch (err) {
    console.warn('Failed to sync progress:', err)
  }
}

/**
 * Update user stats in Firestore
 */
export async function updateUserStats(userId, totalSolved) {
  if (!isFirebaseConfigured || !userId) return
  try {
    const ref = doc(db, 'users', userId)
    await updateDoc(ref, {
      totalSolved,
      lastActiveDate: getToday(),
      updatedAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('Failed to update stats:', err)
  }
}

/**
 * Find a user by username
 */
export async function getUserByUsername(username) {
  if (!isFirebaseConfigured || !username) return null
  try {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  } catch (err) {
    console.warn('Failed to find user:', err)
    return null
  }
}

/**
 * Search users by username prefix
 */
export async function searchUsers(queryStr) {
  if (!isFirebaseConfigured || !queryStr || queryStr.length < 2) return []
  try {
    const q = query(
      collection(db, 'users'),
      where('username', '>=', queryStr.toLowerCase()),
      where('username', '<=', queryStr.toLowerCase() + '\uf8ff')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.warn('Failed to search users:', err)
    return []
  }
}
