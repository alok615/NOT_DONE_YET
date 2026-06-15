// ============================================
// !doneyet — Streak Service
// ============================================
// Handles daily streak calculation, activity tracking,
// and persistent streak state management.

import { db, isFirebaseConfigured } from '../config/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Formats a Date object to YYYY-MM-DD in the local timezone
 */
export function formatLocalDate(dateObj) {
  const yyyy = dateObj.getFullYear()
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
export function getToday() {
  return formatLocalDate(new Date())
}

/**
 * Get yesterday's date as YYYY-MM-DD string in local timezone
 */
export function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatLocalDate(d)
}

/**
 * Calculate the new streak based on last active date.
 * - If lastActiveDate is today → no change
 * - If lastActiveDate is yesterday → increment
 * - If lastActiveDate is older → reset to 1
 * - If null (first time) → start at 1
 */
export function calculateStreak(lastActiveDate, currentStreak = 0) {
  const today = getToday()

  if (!lastActiveDate) {
    return { streak: 1, lastActiveDate: today }
  }

  if (lastActiveDate === today) {
    // Already active today, no change
    return { streak: currentStreak, lastActiveDate: today }
  }

  if (lastActiveDate === getYesterday()) {
    // Consecutive day — increment
    return { streak: currentStreak + 1, lastActiveDate: today }
  }

  // Gap detected — reset
  return { streak: 1, lastActiveDate: today }
}

/**
 * Update streak on login/activity.
 * Call this when user logs in or solves a question.
 * Returns the updated profile fields.
 */
export async function updateStreakOnActivity(userId, userProfile, updateProfileFn) {
  if (!userProfile) return null

  const { streak, lastActiveDate } = calculateStreak(
    userProfile.lastActiveDate,
    userProfile.streak || 0
  )

  const bestStreak = Math.max(streak, userProfile.bestStreak || 0)

  // Only update if something changed
  if (
    streak !== userProfile.streak ||
    lastActiveDate !== userProfile.lastActiveDate ||
    bestStreak !== userProfile.bestStreak
  ) {
    const updates = { streak, bestStreak, lastActiveDate }

    // Update via the auth context's updateProfile (handles both Firestore + localStorage)
    if (updateProfileFn) {
      await updateProfileFn(updates)
    }

    return updates
  }

  return null
}

/**
 * Record a daily activity (question solved).
 * Increments the dailyActivity[today] counter.
 */
export async function recordDailyActivity(userId, userProfile, updateProfileFn) {
  if (!userProfile) return

  // ALWAYS fetch the freshest profile from localStorage to prevent React state race conditions
  const rawLocal = localStorage.getItem('doneyet_offline_profile')
  const freshProfile = rawLocal ? JSON.parse(rawLocal) : userProfile

  const today = getToday()
  const dailyActivity = { ...(freshProfile.dailyActivity || {}) }
  dailyActivity[today] = (dailyActivity[today] || 0) + 1

  const updates = { dailyActivity }

  // Also update streak based on fresh profile
  const streakUpdates = calculateStreak(
    freshProfile.lastActiveDate,
    freshProfile.streak || 0
  )
  updates.streak = streakUpdates.streak
  updates.lastActiveDate = streakUpdates.lastActiveDate
  updates.bestStreak = Math.max(streakUpdates.streak, freshProfile.bestStreak || 0)

  if (updateProfileFn) {
    await updateProfileFn(updates)
  }

  return updates
}

/**
 * Record a solved question in the user's profile.
 * Updates: solvedQuestions array, lastSolvedQuestion, dailyActivity, streak
 */
export async function recordSolvedQuestion(userId, userProfile, questionData, updateProfileFn) {
  if (!userProfile) return

  const today = getToday()

  // Build solved question entry
  const solvedEntry = {
    questionId: questionData.questionId,
    topicName: questionData.topicName,
    topicSlug: questionData.topicSlug,
    problemName: questionData.problemName,
    contentIndex: questionData.contentIndex,
    categoryIndex: questionData.categoryIndex,
    questionIndex: questionData.questionIndex,
    solveDate: today,
  }

  // Update solved questions list
  const solvedQuestions = [...(userProfile.solvedQuestions || [])]
  const existingIndex = solvedQuestions.findIndex(q => q.questionId === solvedEntry.questionId)
  if (existingIndex >= 0) {
    solvedQuestions[existingIndex] = solvedEntry
  } else {
    solvedQuestions.push(solvedEntry)
  }

  // Update daily activity
  const dailyActivity = { ...(userProfile.dailyActivity || {}) }
  dailyActivity[today] = (dailyActivity[today] || 0) + 1

  // Update streak
  const { streak, lastActiveDate } = calculateStreak(
    userProfile.lastActiveDate,
    userProfile.streak || 0
  )
  const bestStreak = Math.max(streak, userProfile.bestStreak || 0)

  const updates = {
    solvedQuestions,
    dailyActivity,
    streak,
    bestStreak,
    lastActiveDate,
    lastSolvedQuestion: {
      topicName: questionData.topicName,
      topicSlug: questionData.topicSlug,
      problemName: questionData.problemName,
      contentIndex: questionData.contentIndex,
    },
  }

  if (updateProfileFn) {
    await updateProfileFn(updates)
  }

  return updates
}

/**
 * Remove a solved question (when user un-checks it).
 */
export async function removeSolvedQuestion(userId, userProfile, questionId, updateProfileFn) {
  if (!userProfile) return

  const solvedQuestions = (userProfile.solvedQuestions || []).filter(
    q => q.questionId !== questionId
  )

  // Decrement today's activity
  const today = getToday()
  const dailyActivity = { ...(userProfile.dailyActivity || {}) }
  if (dailyActivity[today] && dailyActivity[today] > 0) {
    dailyActivity[today] -= 1
  }

  const updates = { solvedQuestions, dailyActivity }

  if (updateProfileFn) {
    await updateProfileFn(updates)
  }

  return updates
}

/**
 * Get streak display info for UI
 */
export function getStreakInfo(userProfile) {
  const streak = userProfile?.streak || 0
  const bestStreak = userProfile?.bestStreak || 0
  const lastActive = userProfile?.lastActiveDate

  let status = 'none'
  if (streak > 0 && lastActive === getToday()) {
    status = 'active' // Streak is alive today
  } else if (streak > 0 && lastActive === getYesterday()) {
    status = 'at_risk' // Haven't solved today, will break tomorrow
  } else {
    status = 'broken' // Streak is broken
  }

  return { streak, bestStreak, status }
}
