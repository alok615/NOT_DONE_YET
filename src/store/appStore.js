// ============================================
// !doneyet — Zustand App Store (Enhanced)
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addToRevisionQueue, removeFromRevisionQueue } from '../services/revisionService'

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── UI State ──
      theme: 'dark',
      sidebarOpen: false,
      chatWidgetOpen: false,

      // ── Data State ──
      data: null, // Full question data from ultimateData.js
      searchQuery: '',
      bookmarkFilter: false,

      // ── Actions: UI ──
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', newTheme)
        set({ theme: newTheme })
      },

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleChatWidget: () => set((s) => ({ chatWidgetOpen: !s.chatWidgetOpen })),
      setChatWidgetOpen: (open) => set({ chatWidgetOpen: open }),

      // ── Actions: Search ──
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleBookmarkFilter: () => set((s) => ({ bookmarkFilter: !s.bookmarkFilter })),

      // ── Actions: Data ──
      setData: (data) => {
        set({ data })
        try {
          localStorage.setItem('doneyet_data', JSON.stringify(data))
        } catch (e) {
          console.warn('Failed to save to localStorage:', e)
        }
      },

      // Mark a question as done/undone
      toggleQuestion: (contentIndex, categoryIndex, questionIndex) => {
        const data = JSON.parse(JSON.stringify(get().data))
        const topic = data.data.content[contentIndex]
        const question = topic.categoryList[categoryIndex].questionList[questionIndex]

        const wasDone = question.isDone
        question.isDone = !wasDone

        // Update counters
        const delta = wasDone ? -1 : 1
        topic.contentCompletedQuestions += delta
        topic.categoryList[categoryIndex].categoryCompletedQuestions += delta
        data.data.header.completedQuestions += delta

        // Track solve date for revision
        if (!wasDone) {
          question.solveDate = new Date().toISOString().slice(0, 10)

          // Add to revision queue (spaced repetition)
          try {
            addToRevisionQueue({
              questionId: question.questionId,
              topicName: topic.contentHeading,
              topicSlug: topic.contentPath,
              problemName: question.questionHeading,
              contentIndex,
              categoryIndex,
              questionIndex,
              solveDate: question.solveDate,
            })
          } catch (e) { /* not critical */ }
        } else {
          question.solveDate = null
          // Remove from revision queue
          try {
            removeFromRevisionQueue(question.questionId)
          } catch (e) { /* not critical */ }
        }

        get().setData(data)
        return !wasDone // return new state
      },

      // ── Actions: Revision ──
      scheduleRevision: async (question) => {
        try {
          if (typeof window !== 'undefined') {
            await addToRevisionQueue(question)
          }
        } catch (err) { /* not critical */ }
      },

      // Toggle bookmark
      toggleBookmark: (contentIndex, categoryIndex, questionIndex) => {
        const data = JSON.parse(JSON.stringify(get().data))
        const question = data.data.content[contentIndex]
          .categoryList[categoryIndex]
          .questionList[questionIndex]

        question.isBookmarked = !question.isBookmarked
        get().setData(data)
      },

      // Update notes
      updateNotes: (contentIndex, categoryIndex, questionIndex, notes) => {
        const data = JSON.parse(JSON.stringify(get().data))
        data.data.content[contentIndex]
          .categoryList[categoryIndex]
          .questionList[questionIndex].userNotes = notes
        get().setData(data)
      },

      // Get stats
      getStats: () => {
        const data = get().data
        if (!data) return { total: 0, completed: 0, percentage: 0 }
        const total = data.data.header.totalQuestions
        const completed = data.data.header.completedQuestions
        return {
          total,
          completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
      },

      // Get per-topic stats
      getTopicStats: () => {
        const data = get().data
        if (!data) return []
        return data.data.content.map((topic) => ({
          name: topic.contentHeading,
          path: topic.contentPath,
          total: topic.contentTotalQuestions,
          completed: topic.contentCompletedQuestions,
          percentage: topic.contentTotalQuestions > 0
            ? Math.round((topic.contentCompletedQuestions / topic.contentTotalQuestions) * 100)
            : 0,
        }))
      },

      // Get today's solved count from data
      getTodaySolved: () => {
        const data = get().data
        if (!data) return 0
        const today = new Date().toISOString().slice(0, 10)
        let count = 0
        data.data.content.forEach((topic) => {
          topic.categoryList.forEach((cat) => {
            cat.questionList.forEach((q) => {
              if (q.isDone && q.solveDate === today) count++
            })
          })
        })
        return count
      },
    }),
    {
      name: 'doneyet-ui-store',
      partialize: (state) => ({
        theme: state.theme,
        bookmarkFilter: state.bookmarkFilter,
      }),
    }
  )
)

export default useAppStore
