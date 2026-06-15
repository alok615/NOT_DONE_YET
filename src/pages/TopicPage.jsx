// ============================================
// !doneyet — Topic Detail Page
// ============================================

import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Search,
  BookmarkCheck,
  Bookmark,
  StickyNote,
  Check,
  Filter,
} from 'lucide-react'
import { TakeUForwardIcon, LeetCodeIcon, GFGIcon, YouTubeIcon } from '../components/PlatformIcons'
import useAppStore from '../store/appStore'
import { useAuth } from '../contexts/AuthContext'
import { recordDailyActivity, removeSolvedQuestion } from '../services/streakService'

function TopicPage() {
  const { slug } = useParams()
  const { userProfile, updateProfile } = useAuth()
  const {
    data,
    toggleQuestion,
    toggleBookmark,
    updateNotes,
    searchQuery,
    setSearchQuery,
    bookmarkFilter,
    toggleBookmarkFilter,
  } = useAppStore()

  const [collapsedCategories, setCollapsedCategories] = useState({})
  const [expandedNotes, setExpandedNotes] = useState({})
  const [localSearch, setLocalSearch] = useState('')

  // Wrapped toggleQuestion that also updates streak + daily activity
  const handleToggleQuestion = (ci, catI, qI) => {
    const wasDone = data?.data?.content?.[ci]?.categoryList?.[catI]?.questionList?.[qI]?.isDone
    toggleQuestion(ci, catI, qI)

    if (!wasDone && updateProfile && userProfile) {
      // Question was just marked as DONE — record daily activity + update streak
      recordDailyActivity(userProfile?.id, userProfile, updateProfile)
    }
  }

  // Find the topic
  const contentIndex = useMemo(() => {
    if (!data) return -1
    return data.data.content.findIndex(
      (t) => t.contentPath === `/${slug}` || t.contentPath.replace('/', '') === slug
    )
  }, [data, slug])

  const topic = data?.data?.content?.[contentIndex]

  if (!data || contentIndex === -1 || !topic) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-title">Topic not found</div>
          <div className="empty-state-desc">This topic doesn't exist or the URL is incorrect.</div>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const progress = topic.contentTotalQuestions > 0
    ? Math.round((topic.contentCompletedQuestions / topic.contentTotalQuestions) * 100)
    : 0

  const activeSearch = localSearch || searchQuery

  const toggleCategory = (catId) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  const toggleNotePanel = (key) => {
    setExpandedNotes((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <Link
          to="/dashboard"
          className="flex items-center gap-2"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-3)',
            display: 'inline-flex',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">{topic.contentHeading}</h1>
            {topic.contentSubHeading && (
              <p className="page-subtitle">{topic.contentSubHeading}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-success)' }}>
                {topic.contentCompletedQuestions}
              </span>
              /{topic.contentTotalQuestions} solved
            </span>
            <span className="badge badge-accent" style={{ fontSize: 'var(--text-sm)' }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="category-progress-bar" style={{ marginTop: 'var(--space-4)', height: 6 }}>
          <div className="category-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="flex items-center gap-3"
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <div className="search-container" style={{ flex: 1, maxWidth: 400 }}>
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search questions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Search questions"
            style={{ paddingLeft: 36 }}
          />
        </div>

        <button
          className={`btn btn-sm ${bookmarkFilter ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleBookmarkFilter}
          title={bookmarkFilter ? 'Show all questions' : 'Show bookmarked only'}
        >
          <Filter size={14} />
          {bookmarkFilter ? 'Bookmarked' : 'Filter'}
        </button>
      </div>

      {/* Categories */}
      {topic.categoryList.map((category, catIndex) => {
        const isCollapsed = collapsedCategories[category.categoryId]
        const catProgress = category.categoryTotalQuestions > 0
          ? Math.round((category.categoryCompletedQuestions / category.categoryTotalQuestions) * 100)
          : 0

        // Filter questions
        const filteredQuestions = category.questionList.filter((q) => {
          if (bookmarkFilter && !q.isBookmarked) return false
          if (activeSearch) {
            return q.questionHeading.toLowerCase().includes(activeSearch.toLowerCase())
          }
          return true
        })

        if (activeSearch && filteredQuestions.length === 0) return null

        return (
          <div className="category-section" key={category.categoryId}>
            {/* Category Header */}
            <div
              className="category-header"
              onClick={() => toggleCategory(category.categoryId)}
              role="button"
              aria-expanded={!isCollapsed}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleCategory(category.categoryId)}
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                <span className="category-title">{category.categoryName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="category-progress" style={{ fontSize: 'var(--text-xs)' }}>
                  {category.categoryCompletedQuestions}/{category.categoryTotalQuestions}
                </span>
                <div className="category-progress-bar" style={{ width: 80 }}>
                  <div className="category-progress-fill" style={{ width: `${catProgress}%` }} />
                </div>
              </div>
            </div>

            {/* Questions */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="question-list">
                    {filteredQuestions.map((question, qIndex) => {
                      const actualQIndex = category.questionList.indexOf(question)
                      const noteKey = `${catIndex}-${actualQIndex}`
                      const isNotesOpen = expandedNotes[noteKey]

                      return (
                        <div key={question.questionId || actualQIndex}>
                          <div className={`question-row ${question.isDone ? 'completed' : ''}`}>
                            {/* Checkbox */}
                            <div
                              className={`checkbox-custom ${question.isDone ? 'checked' : ''}`}
                              onClick={() => handleToggleQuestion(contentIndex, catIndex, actualQIndex)}
                              role="checkbox"
                              aria-checked={question.isDone}
                              aria-label={`Mark ${question.questionHeading} as ${question.isDone ? 'undone' : 'done'}`}
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && handleToggleQuestion(contentIndex, catIndex, actualQIndex)}
                            >
                              {question.isDone && <Check size={14} />}
                            </div>

                            {/* Question Info */}
                            <div className="question-info">
                              <span className={`question-title ${question.isDone ? 'done' : ''}`}>
                                {question.questionHeading}
                              </span>
                            </div>

                            {/* Platform Links */}
                            <div className="question-links">
                              {question.questionLink && (
                                <a
                                  href={question.questionLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="platform-link tuf"
                                  title="TakeUForward"
                                >
                                  <TakeUForwardIcon size={18} />
                                </a>
                              )}
                              {question.leetCodeLink && (
                                <a
                                  href={question.leetCodeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="platform-link leetcode"
                                  title="LeetCode"
                                >
                                  <LeetCodeIcon size={18} />
                                </a>
                              )}
                              {question.gfgLink && (
                                <a
                                  href={question.gfgLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="platform-link gfg"
                                  title="GeeksForGeeks"
                                >
                                  <GFGIcon size={18} />
                                </a>
                              )}
                              {question.youTubeLink && (
                                <a
                                  href={question.youTubeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="platform-link youtube"
                                  title="YouTube"
                                >
                                  <YouTubeIcon size={18} />
                                </a>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="question-actions">
                              <button
                                className={`btn-icon ${question.isBookmarked ? 'active' : ''}`}
                                onClick={() => toggleBookmark(contentIndex, catIndex, actualQIndex)}
                                title={question.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                                aria-label={question.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                              >
                                {question.isBookmarked ? (
                                  <BookmarkCheck size={16} style={{ color: 'var(--color-warning)' }} />
                                ) : (
                                  <Bookmark size={16} />
                                )}
                              </button>
                              <button
                                className={`btn-icon ${question.userNotes ? 'active' : ''}`}
                                onClick={() => toggleNotePanel(noteKey)}
                                title={question.userNotes ? 'Edit notes' : 'Add notes'}
                                aria-label="Toggle notes"
                              >
                                <StickyNote size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Notes Panel */}
                          <AnimatePresence>
                            {isNotesOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  overflow: 'hidden',
                                  background: 'var(--bg-card)',
                                  borderBottom: '1px solid var(--border-primary)',
                                }}
                              >
                                <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-12)' }}>
                                  <textarea
                                    className="input-field"
                                    style={{
                                      minHeight: 80,
                                      resize: 'vertical',
                                      fontSize: 'var(--text-sm)',
                                      fontFamily: 'var(--font-mono)',
                                    }}
                                    placeholder="Add your notes here..."
                                    value={question.userNotes || ''}
                                    onChange={(e) =>
                                      updateNotes(contentIndex, catIndex, actualQIndex, e.target.value)
                                    }
                                    aria-label={`Notes for ${question.questionHeading}`}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default TopicPage
