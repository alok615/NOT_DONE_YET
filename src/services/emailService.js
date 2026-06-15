// ============================================
// !doneyet — Email Notification Service
// ============================================
//
// SETUP INSTRUCTIONS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create email templates:
//    - Goal Reminder template (template_goal)
//    - Weekly Report template (template_weekly)
// 4. Add the following to your .env file:
//    VITE_EMAILJS_PUBLIC_KEY=your_public_key
//    VITE_EMAILJS_SERVICE_ID=your_service_id
//    VITE_EMAILJS_TEMPLATE_GOAL=your_template_id
//    VITE_EMAILJS_TEMPLATE_WEEKLY=your_template_id
//
// Template variables for Goal Reminder:
//   {{user_name}} - User's display name
//   {{missed_count}} - Number of problems missed
//   {{streak}} - Current streak count
//   {{current_date}} - Today's date
//   {{to_email}} - User's email
//
// Template variables for Weekly Report:
//   {{user_name}} - User's display name
//   {{solved_this_week}} - Problems solved this week
//   {{total_solved}} - Total problems solved
//   {{streak}} - Current streak
//   {{top_topic}} - Best performing topic
//   {{to_email}} - User's email

import emailjs from '@emailjs/browser'

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_GOAL = import.meta.env.VITE_EMAILJS_TEMPLATE_GOAL || ''
const TEMPLATE_WEEKLY = import.meta.env.VITE_EMAILJS_TEMPLATE_WEEKLY || ''

// Initialize EmailJS
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

/**
 * Send daily goal reminder email
 */
export async function sendGoalReminder(userEmail, userName, missedGoal, streak) {
  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_GOAL) {
    console.warn('EmailJS not configured — skipping goal reminder email')
    return false
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_GOAL, {
      to_email: userEmail,
      user_name: userName || 'Coder',
      missed_count: missedGoal,
      streak: streak || 0,
      current_date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })
    console.log('Goal reminder email sent to', userEmail)
    return true
  } catch (err) {
    console.error('Failed to send goal reminder:', err)
    return false
  }
}

/**
 * Send weekly progress report email
 */
export async function sendWeeklyReport(userEmail, userName, weeklyStats) {
  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_WEEKLY) {
    console.warn('EmailJS not configured — skipping weekly report email')
    return false
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_WEEKLY, {
      to_email: userEmail,
      user_name: userName || 'Coder',
      solved_this_week: weeklyStats.solvedThisWeek || 0,
      total_solved: weeklyStats.totalSolved || 0,
      streak: weeklyStats.streak || 0,
      top_topic: weeklyStats.topTopic || 'N/A',
    })
    console.log('Weekly report sent to', userEmail)
    return true
  } catch (err) {
    console.error('Failed to send weekly report:', err)
    return false
  }
}

/**
 * Send friend request notification email
 */
export async function sendFriendRequestNotification(userEmail, fromUsername) {
  if (!PUBLIC_KEY || !SERVICE_ID) {
    console.warn('EmailJS not configured — skipping friend request email')
    return false
  }

  // Uses the goal template as a generic notification for now
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_GOAL, {
      to_email: userEmail,
      user_name: 'there',
      missed_count: `${fromUsername} sent you a friend request on !doneyet`,
      streak: 'Check it out!',
      current_date: new Date().toLocaleDateString(),
    })
    return true
  } catch (err) {
    console.error('Failed to send friend request notification:', err)
    return false
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured() {
  return !!(PUBLIC_KEY && SERVICE_ID && TEMPLATE_GOAL)
}
