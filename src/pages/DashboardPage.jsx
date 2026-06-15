// ============================================
// !doneyet — Dashboard Page (Full Redesign)
// Layout: Main Content + Right Sidebar
// ============================================

import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useAppStore from '../store/appStore'
import WeeklyHeatmap from '../components/WeeklyHeatmap'
import RightSidebar from '../components/RightSidebar'
import { updateStreakOnActivity, getStreakInfo } from '../services/streakService'

import arraysImg from '../assets/topics/arrays.png'
import binarySearchImg from '../assets/topics/binary_search.png'
import stringsImg from '../assets/topics/strings.png'
import linkedListImg from '../assets/topics/linked_list.png'
import bitManipulationImg from '../assets/topics/bit_manipulation.png'
import stackQueueImg from '../assets/topics/stack_queue.png'
import twoPointersImg from '../assets/topics/two_pointers.png'
import heapsImg from '../assets/topics/heaps.png'
import greedyImg from '../assets/topics/greedy.png'

// ── Topic icon map ──
const TOPIC_ICONS = {
  basics: { type: 'emoji', value: '📖' },
  sorting: { type: 'emoji', value: '🔀' },
  arrays: { type: 'image', src: arraysImg },
  'binary search': { type: 'image', src: binarySearchImg },
  strings: { type: 'image', src: stringsImg },
  'linked list': { type: 'image', src: linkedListImg },
  recursion: { type: 'emoji', value: '🔁' },
  'bit manipulation': { type: 'image', src: bitManipulationImg },
  'stack': { type: 'image', src: stackQueueImg },
  queue: { type: 'image', src: stackQueueImg },
  'stack & queue': { type: 'image', src: stackQueueImg },
  'stack and queue': { type: 'image', src: stackQueueImg },
  'two pointers': { type: 'image', src: twoPointersImg },
  heaps: { type: 'image', src: heapsImg },
  greedy: { type: 'image', src: greedyImg },
  'binary tree': { type: 'emoji', value: '🌿' },
  'binary search tree': { type: 'emoji', value: '🌴' },
  graphs: { type: 'emoji', value: '🗺️' },
  'dynamic programming': { type: 'emoji', value: '🧩' },
  tries: { type: 'emoji', value: '🔤' },
  matrix: { type: 'emoji', value: '📐' },
  backtracking: { type: 'emoji', value: '🔙' },
  'sliding window': { type: 'emoji', value: '🖼️' },
}

function getTopicIcon(heading) {
  const lower = heading.toLowerCase()
  for (const [key, icon] of Object.entries(TOPIC_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return { type: 'emoji', value: '📂' }
}

// ── Time of day greeting ──
function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5 && h <= 11) return 'Morning'
  if (h >= 12 && h <= 16) return 'Afternoon'
  if (h >= 17 && h <= 23) return 'Evening'
  return 'Night'
}

// ── Relative time helper ──
function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

// ── Glass card base style ──
const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 'var(--radius-xl)',
  padding: 20,
}

function DashboardPage() {
  const { userProfile, updateProfile } = useAuth()
  const { data, getStats } = useAppStore()
  const navigate = useNavigate()
  const stats = getStats()
  const topics = data?.data?.content || []
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [heatmapExpanded, setHeatmapExpanded] = useState(false)

  // Update streak on dashboard load
  useEffect(() => {
    if (userProfile && updateProfile) {
      updateStreakOnActivity(userProfile?.id, userProfile, updateProfile)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const streakInfo = getStreakInfo(userProfile)

  const name = userProfile?.username || userProfile?.displayName?.split(' ')[0] || 'there'

  // Find the topic closest to completion (not 100%) for "Continue Solving" prompt
  const nearestTopic = useMemo(() => {
    const inProgress = topics
      .filter((t) => t.contentTotalQuestions > 0 && t.contentCompletedQuestions < t.contentTotalQuestions)
      .map((t) => ({
        ...t,
        ratio: t.contentCompletedQuestions / t.contentTotalQuestions,
        remaining: t.contentTotalQuestions - t.contentCompletedQuestions,
      }))
      .sort((a, b) => b.ratio - a.ratio)
    return inProgress[0] || null
  }, [topics])

  // Top 4 topics by progress for the progress card
  const topTopics = useMemo(() => {
    return [...topics]
      .filter((t) => t.contentTotalQuestions > 0)
      .sort((a, b) => {
        const ra = a.contentCompletedQuestions / a.contentTotalQuestions
        const rb = b.contentCompletedQuestions / b.contentTotalQuestions
        return rb - ra
      })
      .slice(0, 4)
  }, [topics])

  // Loading skeleton
  if (!data) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ flex: 1 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 60, marginBottom: 16, borderRadius: 12 }} />
            ))}
          </div>
          <div style={{ width: 320 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* GitHub Project Banner */}
      <div style={{
        background: '#22C55E',
        borderRadius: 'var(--radius-xl)',
        padding: '12px 24px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.2rem' }}>☕</span>
          <span style={{ color: '#000', fontWeight: 600, fontSize: '0.95rem' }}>
            A blazing-fast, offline-first progress tracker for mastering Data Structures & Algorithms.
          </span>
        </div>
        <a 
          href="https://github.com/alok615/NOT_DONE_YET" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            background: '#fff',
            color: '#000',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          This Project
        </a>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        {/* ════════════ MAIN CONTENT ════════════ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top Section with Greeting and Image */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
            {/* Left side: Greeting, Stats, Tagline, Continue Solving */}
            <div style={{ flex: 1, paddingRight: 32 }}>
              {/* ── 1. Greeting ── */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Good {getTimeOfDay()},{' '}
              <span style={{ color: 'var(--accent-green)' }}>{name}</span>.
            </h1>
          </div>

          {/* ── 2. Stats Row ── */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginBottom: 20,
            }}
          >
            {/* Problems Solved */}
            <div
              style={{
                ...glassCard,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(0,255,136,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--accent-green)',
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {'<>'}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {stats.completed}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    marginTop: 4,
                  }}
                >
                  Problems Solved
                </div>
              </div>
            </div>

            {/* Day Streak */}
            <div
              style={{
                ...glassCard,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated fire glow behind the emoji */}
              {streakInfo.streak > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: streakInfo.status === 'active'
                      ? 'radial-gradient(circle, rgba(255,170,0,0.25) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(255,170,0,0.1) 0%, transparent 70%)',
                    animation: streakInfo.status === 'active' ? 'fireGlow 1.5s ease-in-out infinite' : 'none',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-lg)',
                  background: streakInfo.streak > 0 ? 'rgba(255,170,0,0.12)' : 'rgba(255,170,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 22,
                  animation: streakInfo.streak > 0 ? 'fireBurn 2s ease-in-out infinite' : 'none',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                🔥
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: streakInfo.streak > 0 ? '#ffaa00' : 'var(--text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {streakInfo.streak}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: streakInfo.status === 'at_risk' ? '#ff6b35' : 'var(--text-tertiary)',
                    marginTop: 4,
                  }}
                >
                  {streakInfo.status === 'at_risk' ? 'Solve today to keep streak!' : 'Day Streak'}
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. Tagline ── */}
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: 24,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {stats.completed > 0 ? (
              <>
                The grind{' '}
                <span
                  style={{
                    textDecoration: 'underline',
                    textDecorationColor: 'var(--accent-green)',
                    textUnderlineOffset: 3,
                    color: 'var(--accent-green)',
                  }}
                >
                  continues
                </span>
                .
              </>
            ) : (
              <>
                The grind{' '}
                <span
                  style={{
                    textDecoration: 'underline',
                    textDecorationColor: 'var(--accent-green)',
                    textUnderlineOffset: 3,
                    color: 'var(--accent-green)',
                  }}
                >
                  starts now
                </span>
                .
              </>
            )}
          </div>

          {/* ── 4. Continue Solving ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 28,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => {
                if (nearestTopic) {
                  navigate(`/topic/${nearestTopic.contentPath.replace('/', '')}`)
                } else {
                  navigate('/dashboard')
                }
              }}
              style={{
                padding: '10px 22px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Continue Solving →
            </button>
            {nearestTopic && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                }}
              >
                You're only{' '}
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                  {nearestTopic.remaining} problem{nearestTopic.remaining !== 1 ? 's' : ''}
                </span>{' '}
                away from completing{' '}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {nearestTopic.contentHeading}
                </span>
                .
              </span>
            )}
            {!nearestTopic && stats.completed > 0 && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                All topics completed! 🎉
              </span>
            )}
            {!nearestTopic && stats.completed === 0 && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Pick a topic and start your DSA journey!
              </span>
            )}
          </div>
            </div>

            {/* Right side: Coffee Man Image */}
            <div style={{ flexShrink: 1, maxWidth: 300, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: -10 }}>
              <img 
                src={new URL('../assets/coffee-man.jpg', import.meta.url).href} 
                alt="Coffee Man" 
                style={{ width: '100%', height: 'auto', opacity: 0.85 }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          </div>

          {/* ── 5. Three Cards Row ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 36,
            }}
          >
            {/* Card 1: Continue Where You Left Off */}
            <div style={glassCard}>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                Continue Where You Left Off
              </div>
              {userProfile?.lastSolvedQuestion ? (
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 6,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {userProfile.lastSolvedQuestion.name || 'Last Question'}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {userProfile.lastSolvedQuestion.topic || 'Topic'}
                    {userProfile.lastSolvedQuestion.solvedAt && (
                      <> · {timeAgo(userProfile.lastSolvedQuestion.solvedAt)}</>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-tertiary)',
                      marginBottom: 10,
                    }}
                  >
                    No problems solved yet
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (topics.length > 0) {
                        navigate(`/topic/${topics[0].contentPath.replace('/', '')}`)
                      }
                    }}
                    style={{ cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', padding: '8px 16px' }}
                  >
                    Start your first problem
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: Activity Calendar */}
            <div style={glassCard}>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                Activity Calendar
              </div>
              <WeeklyHeatmap
                activityData={userProfile?.dailyActivity || {}}
                onToggleExpand={() => setHeatmapExpanded(true)}
              />
            </div>

            {/* Card 3: Topic Progress (top 4) */}
            <div style={glassCard}>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                Topic Progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topTopics.map((t, i) => {
                  const pct = Math.round(
                    (t.contentCompletedQuestions / t.contentTotalQuestions) * 100
                  )
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '70%',
                          }}
                        >
                          {t.contentHeading}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)',
                            flexShrink: 0,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 4,
                          borderRadius: 2,
                          background: 'rgba(255,255,255,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: pct === 100 ? 'var(--accent-green)' : 'var(--accent-green-dim)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                {topTopics.length === 0 && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    No topics available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ RIGHT SIDEBAR ════════════ */}
        <RightSidebar userProfile={userProfile} stats={stats} topics={topics} />
      </div>

      {/* ── 6. Topic Library (Full Width) ── */}
      <div style={{ marginTop: 36 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Topic Library
          </h2>
          <button
            onClick={() => setShowAllTopics(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-green)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,255,136,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {showAllTopics ? '← Show less' : 'View all →'}
          </button>
        </div>

        <div
          className="topic-library-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            transition: 'all 0.3s ease',
          }}
        >
          {(showAllTopics ? topics : topics.slice(0, 8)).map((topic, i) => {
            const solved = topic.contentCompletedQuestions
            const total = topic.contentTotalQuestions
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0
            const icon = getTopicIcon(topic.contentHeading)

            return (
              <div
                key={i}
                onClick={() => navigate(`/topic/${topic.contentPath.replace('/', '')}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/topic/${topic.contentPath.replace('/', '')}`)
                  }
                }}
                style={{
                  ...glassCard,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Topic icon + name */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  {icon.type === 'image' ? (
                    <img src={icon.src} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 20 }}>{icon.value}</span>
                  )}
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {topic.contentHeading}
                  </div>
                </div>

                {/* Solved count */}
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--accent-green)',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {solved}
                  </span>
                  /{total} solved
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 2,
                      background:
                        pct === 100
                          ? 'var(--accent-green)'
                          : pct > 0
                            ? 'var(--accent-green-dim)'
                            : 'transparent',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                {/* Last solved info */}
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {solved > 0 ? `${pct}% complete` : 'Not started'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ════════════ HEATMAP EXPAND MODAL ════════════ */}
      {heatmapExpanded && (
        <div
          onClick={() => setHeatmapExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 20,
              padding: '32px 40px',
              maxWidth: 600,
              width: '90%',
              boxShadow: '0 0 60px rgba(34,197,94,0.1), 0 0 120px rgba(34,197,94,0.05)',
              animation: 'modalSlideIn 0.3s ease',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setHeatmapExpanded(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                fontSize: 18,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              ✕
            </button>

            <h3
              style={{
                color: 'var(--text-primary)',
                fontSize: '1.2rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                margin: '0 0 24px',
              }}
            >
              📅 Activity Calendar
            </h3>
            <WeeklyHeatmap
              activityData={userProfile?.dailyActivity || {}}
              isExpanded={true}
            />
          </div>
        </div>
      )}

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes fireBurn {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-3deg); }
          50% { transform: scale(1.15) rotate(2deg); }
          75% { transform: scale(1.08) rotate(-1deg); }
        }
        @keyframes fireGlow {
          0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 1024px) {
          .page-content > div:first-child {
            flex-direction: column !important;
          }
          .page-content > div:first-child > aside {
            width: 100% !important;
          }
        }
        @media (max-width: 768px) {
          .page-content > div:first-child > div:first-child > div:nth-child(5) {
            grid-template-columns: 1fr !important;
          }
          .page-content > div:first-child > div:first-child > div:last-child > div:last-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .page-content > div:first-child > div:first-child > div:nth-child(2) {
            flex-direction: column !important;
          }
          .page-content > div:first-child > div:first-child > div:last-child > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage
