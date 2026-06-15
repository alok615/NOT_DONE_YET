// ============================================
// !doneyet — Revision Service (Spaced Repetition)
// ============================================
// Implements Day 1/3/7/15/30 spaced repetition scheduling.
// All data stored in localStorage (offline-first) with optional Firestore sync.

import { getToday, formatLocalDate } from './streakService'

const REVISION_INTERVALS = [1, 3, 7, 15, 30] // Days after solve date

/**
 * Schedule a question for revision after it's solved.
 * Creates due dates at +1, +3, +7, +15, +30 days from solve date.
 */
export function scheduleRevision(questionData) {
  const solveDate = questionData.solveDate || getToday()
  const baseDate = new Date(solveDate)

  const dueDates = REVISION_INTERVALS.map(days => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + days)
    return formatLocalDate(d)
  })

  return {
    questionId: questionData.questionId,
    topicName: questionData.topicName,
    topicSlug: questionData.topicSlug || '',
    problemName: questionData.problemName || questionData.questionHeading || '',
    contentIndex: questionData.contentIndex,
    categoryIndex: questionData.categoryIndex,
    questionIndex: questionData.questionIndex,
    solveDate,
    dueDates,
    completedDates: [],
    status: 'active', // active | strong | needs_revision | forgotten | mastered
    lastReviewed: null,
    reviewCount: 0,
  }
}

/**
 * Get all revision items from localStorage.
 */
export function getRevisionQueue() {
  try {
    const saved = localStorage.getItem('doneyet_revisions')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

/**
 * Save revision queue to localStorage.
 */
export function saveRevisionQueue(queue) {
  try {
    localStorage.setItem('doneyet_revisions', JSON.stringify(queue))
  } catch (e) {
    console.warn('Failed to save revision queue:', e)
  }
}

/**
 * Add a question to the revision queue.
 */
export function addToRevisionQueue(questionData) {
  const queue = getRevisionQueue()

  // Check if already exists
  const existingIndex = queue.findIndex(r => r.questionId === questionData.questionId)
  const revision = scheduleRevision(questionData)

  if (existingIndex >= 0) {
    // Re-schedule (user re-solved)
    queue[existingIndex] = {
      ...queue[existingIndex],
      ...revision,
      completedDates: queue[existingIndex].completedDates || [],
      reviewCount: queue[existingIndex].reviewCount || 0,
    }
  } else {
    queue.push(revision)
  }

  saveRevisionQueue(queue)
  return revision
}

/**
 * Remove a question from the revision queue (user un-solved it).
 */
export function removeFromRevisionQueue(questionId) {
  const queue = getRevisionQueue().filter(r => r.questionId !== questionId)
  saveRevisionQueue(queue)
}

/**
 * Get revisions that are due today or overdue.
 * A revision is due if any dueDates entry <= today AND not in completedDates.
 */
export function getDueRevisions() {
  const today = getToday()
  const queue = getRevisionQueue()

  return queue.filter(item => {
    if (item.status === 'mastered') return false

    return item.dueDates.some(dueDate => {
      return dueDate <= today && !item.completedDates.includes(dueDate)
    })
  }).map(item => {
    // Find the next uncompleted due date
    const nextDue = item.dueDates.find(
      d => d <= today && !item.completedDates.includes(d)
    )
    const dayNumber = REVISION_INTERVALS[item.dueDates.indexOf(nextDue)]

    return {
      ...item,
      nextDueDate: nextDue,
      dayLabel: dayNumber ? `Day ${dayNumber}` : 'Overdue',
      isOverdue: nextDue < today,
    }
  })
}

/**
 * Get a summary of due revisions grouped by topic.
 */
export function getRevisionSummary() {
  const due = getDueRevisions()
  const total = due.length

  // Group by topic
  const byTopic = {}
  due.forEach(item => {
    if (!byTopic[item.topicName]) {
      byTopic[item.topicName] = { topicName: item.topicName, count: 0, items: [] }
    }
    byTopic[item.topicName].count++
    byTopic[item.topicName].items.push(item)
  })

  const topics = Object.values(byTopic).sort((a, b) => b.count - a.count)

  return { total, topics }
}

/**
 * Complete a revision with self-rating.
 * @param {string} questionId
 * @param {'easy' | 'hard' | 'forgot'} rating — user's self-assessment
 */
export function completeRevision(questionId, rating) {
  const queue = getRevisionQueue()
  const index = queue.findIndex(r => r.questionId === questionId)
  if (index < 0) return null

  const today = getToday()
  const item = { ...queue[index] }

  // Mark the current due date as completed
  const nextDue = item.dueDates.find(
    d => d <= today && !item.completedDates.includes(d)
  )
  if (nextDue) {
    item.completedDates = [...(item.completedDates || []), nextDue]
  }

  item.lastReviewed = today
  item.reviewCount = (item.reviewCount || 0) + 1

  // Update status based on rating
  switch (rating) {
    case 'easy':
      // All due dates completed → mastered
      const allCompleted = item.dueDates.every(d => item.completedDates.includes(d))
      item.status = allCompleted ? 'mastered' : 'strong'
      break
    case 'hard':
      item.status = 'needs_revision'
      break
    case 'forgot':
      item.status = 'forgotten'
      // Re-schedule: add new due dates from today
      const newDates = REVISION_INTERVALS.slice(0, 3).map(days => {
        const d = new Date(today)
        d.setDate(d.getDate() + days)
        return formatLocalDate(d)
      })
      item.dueDates = [...item.dueDates, ...newDates.filter(d => !item.dueDates.includes(d))]
      break
    default:
      item.status = 'active'
  }

  queue[index] = item
  saveRevisionQueue(queue)
  return item
}

/**
 * Get revision stats for display.
 */
export function getRevisionStats() {
  const queue = getRevisionQueue()
  return {
    total: queue.length,
    mastered: queue.filter(r => r.status === 'mastered').length,
    active: queue.filter(r => r.status === 'active').length,
    needsRevision: queue.filter(r => r.status === 'needs_revision').length,
    forgotten: queue.filter(r => r.status === 'forgotten').length,
    strong: queue.filter(r => r.status === 'strong').length,
    dueToday: getDueRevisions().length,
  }
}
