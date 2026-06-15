// ============================================
// !doneyet — Right Sidebar (Dashboard)
// Streak, Daily Goal, Weakest/Strongest Topic,
// Revision Queue
// ============================================

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingDown, TrendingUp, CheckCircle, Circle, RotateCcw } from 'lucide-react'
import { getToday } from '../services/streakService'
import { getRevisionSummary } from '../services/revisionService'

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 'var(--radius-xl)',
  padding: 20,
}

export default function RightSidebar({ userProfile, stats, topics = [] }) {
  const navigate = useNavigate()
  
  const revisionSummary = getRevisionSummary()
  const totalDue = revisionSummary.total

  // Today's solved count
  const todayKey = new Date().toISOString().slice(0, 10)
  const solvedToday = userProfile?.dailyActivity?.[todayKey] || 0
  const dailyGoalTarget = userProfile?.dailyGoalTarget || 3
  const goalPercentage = Math.min(100, Math.round((solvedToday / dailyGoalTarget) * 100))
  const goalMet = solvedToday >= dailyGoalTarget

  // Weakest & Strongest topics — only consider topics with at least 1 solved
  const { weakest, strongest } = useMemo(() => {
    const attempted = topics.filter(
      (t) => t.contentCompletedQuestions > 0 && t.contentTotalQuestions > 0
    )

    if (attempted.length === 0) {
      return { weakest: null, strongest: null }
    }

    const withRatio = attempted.map((t) => ({
      name: t.contentHeading,
      ratio: t.contentCompletedQuestions / t.contentTotalQuestions,
      percentage: Math.round((t.contentCompletedQuestions / t.contentTotalQuestions) * 100),
    }))

    withRatio.sort((a, b) => a.ratio - b.ratio)

    return {
      weakest: withRatio[0],
      strongest: withRatio[withRatio.length - 1],
    }
  }, [topics])

  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Card 1 — Current Streak */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🔥</span>
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {userProfile?.streak || 0}
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                marginTop: 2,
              }}
            >
              days
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginTop: 12,
          }}
        >
          Best: {userProfile?.bestStreak || 0} days
        </div>
      </div>

      {/* Card 2 — Daily Goal */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          {goalMet ? (
            <CheckCircle size={20} style={{ color: 'var(--accent-green)' }} />
          ) : (
            <Circle size={20} style={{ color: 'var(--text-tertiary)' }} />
          )}
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {solvedToday}{' '}
            <span style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>
              / {dailyGoalTarget}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 10,
          }}
        >
          Solved today
        </div>
        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${goalPercentage}%`,
              height: '100%',
              borderRadius: 3,
              background: 'var(--accent-green)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Card 3 — Weakest Topic */}
      <div style={cardStyle}>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Weakest Topic
        </div>
        {weakest ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
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
                {weakest.name}
              </div>
            </div>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-danger)',
                flexShrink: 0,
              }}
            >
              {weakest.percentage}%
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Start solving to see stats
          </div>
        )}
      </div>

      {/* Card 4 — Strongest Topic */}
      <div style={cardStyle}>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Strongest Topic
        </div>
        {strongest ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
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
                {strongest.name}
              </div>
            </div>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-green)',
                flexShrink: 0,
              }}
            >
              {strongest.percentage}%
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Start solving to see stats
          </div>
        )}
      </div>

      {/* Card 5 — Revision Queue */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={14} style={{ color: 'var(--text-secondary)' }} />
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Revision Queue
            </span>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: totalDue > 0 ? 'rgba(255, 60, 60, 0.15)' : 'rgba(0, 255, 136, 0.1)',
              color: totalDue > 0 ? 'var(--color-danger)' : 'var(--accent-green)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {totalDue}
          </span>
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 14,
          }}
        >
          Questions Due Today
        </div>
        
        {totalDue > 0 ? (
          <div style={{ marginBottom: 14 }}>
            {revisionSummary.topics.slice(0, 3).map((topic, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '4px 0',
                fontSize: 'var(--text-xs)',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{topic.topicName}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{topic.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
              marginBottom: 14,
              padding: '10px 0',
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            No revisions due yet.
          </div>
        )}
        
        <button
          onClick={() => navigate('/revision')}
          style={{
            width: '100%',
            padding: '8px 0',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,136,0.08)'
            e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'
            e.currentTarget.style.color = 'var(--accent-green)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          Start Revision →
        </button>
      </div>
    </aside>
  )
}
