// ============================================
// !doneyet — Revision Page (Spaced Repetition)
// ============================================

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RotateCcw, CheckCircle2, AlertCircle, XCircle,
  Brain, TrendingUp, Clock, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react'
import {
  getDueRevisions, completeRevision, getRevisionStats, getRevisionSummary,
} from '../services/revisionService'

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: 20,
}

function RevisionPage() {
  const navigate = useNavigate()
  const [dueItems, setDueItems] = useState([])
  const [stats, setStats] = useState({ total: 0, mastered: 0, active: 0, needsRevision: 0, forgotten: 0, strong: 0, dueToday: 0 })
  const [summary, setSummary] = useState({ total: 0, topics: [] })
  const [expandedTopics, setExpandedTopics] = useState({})
  const [feedback, setFeedback] = useState({}) // questionId -> message
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const refreshData = () => {
    setDueItems(getDueRevisions())
    setStats(getRevisionStats())
    setSummary(getRevisionSummary())
  }

  useEffect(() => { refreshData() }, [])

  const toggleTopic = (topicName) => {
    setExpandedTopics(prev => ({ ...prev, [topicName]: !prev[topicName] }))
  }

  const handleRate = (questionId, rating) => {
    completeRevision(questionId, rating)

    const messages = {
      easy: '✅ Great! Marked as strong.',
      hard: '⚠️ Noted. Keep practicing!',
      forgot: '🔄 Re-scheduled. You\'ll get it next time!',
    }
    setFeedback(prev => ({ ...prev, [questionId]: messages[rating] }))

    setTimeout(() => {
      setFeedback(prev => { const n = { ...prev }; delete n[questionId]; return n })
      refreshData()
    }, 1500)
  }

  const statCards = [
    { label: 'Due Today', value: stats.dueToday, icon: Clock, color: '#22C55E' },
    { label: 'Active', value: stats.active, icon: Brain, color: '#3b82f6' },
    { label: 'Mastered', value: stats.mastered, icon: CheckCircle2, color: '#22C55E' },
    { label: 'Needs Review', value: stats.needsRevision + stats.forgotten, icon: AlertCircle, color: '#f59e0b' },
  ]

  return (
    <div className="page-content" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <RotateCcw size={28} style={{ color: '#22C55E' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Revision</h1>
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
          Spaced repetition to lock concepts in long-term memory
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <s.icon size={16} style={{ color: s.color }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      {summary.total === 0 ? (
        /* Empty state */
        <div style={{
          ...cardStyle,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: 60, textAlign: 'center',
        }}>
          <Brain size={64} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>
            No revisions due today!
          </h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>
            Questions you solve will appear here for review at Day 1, 3, 7, 15, and 30.
            This spaced repetition helps lock concepts in long-term memory.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #22C55E, #16a34a)',
              color: '#000', fontWeight: 600, fontSize: '0.875rem',
              border: 'none', cursor: 'pointer',
            }}
          >
            Go Solve Problems <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* Due revisions grouped by topic */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {summary.topics.map(topicGroup => {
            const isExpanded = expandedTopics[topicGroup.topicName] !== false // default open
            return (
              <div key={topicGroup.topicName} style={cardStyle}>
                {/* Topic header */}
                <button
                  onClick={() => toggleTopic(topicGroup.topicName)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', padding: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{topicGroup.topicName}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                    }}>
                      {topicGroup.count} due
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* Items */}
                {isExpanded && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topicGroup.items.map(item => (
                      <div key={item.questionId} style={{
                        padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 4 }}>
                              {item.problemName || item.questionId}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                fontSize: '0.7rem', padding: '2px 6px', borderRadius: 6,
                                background: item.isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)',
                                color: item.isOverdue ? '#f87171' : '#22C55E', fontWeight: 600,
                              }}>
                                {item.dayLabel}
                              </span>
                              {item.status !== 'active' && (
                                <span style={{
                                  fontSize: '0.65rem', padding: '2px 6px', borderRadius: 6,
                                  background: item.status === 'strong' ? 'rgba(34,197,94,0.08)' :
                                    item.status === 'forgotten' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                                  color: item.status === 'strong' ? '#4ade80' :
                                    item.status === 'forgotten' ? '#f87171' : '#fbbf24',
                                  textTransform: 'capitalize',
                                }}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rating buttons or feedback */}
                          {feedback[item.questionId] ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', animation: 'fadeIn 0.3s ease' }}>
                              {feedback[item.questionId]}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => handleRate(item.questionId, 'easy')}
                                style={{
                                  padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                  background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                                  border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer',
                                }}
                              >
                                Easy ✓
                              </button>
                              <button
                                onClick={() => handleRate(item.questionId, 'hard')}
                                style={{
                                  padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                  background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                                  border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer',
                                }}
                              >
                                Hard ⚠
                              </button>
                              <button
                                onClick={() => handleRate(item.questionId, 'forgot')}
                                style={{
                                  padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                  background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                  border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                                }}
                              >
                                Forgot ✗
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* How it works */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-primary)', padding: 0,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>💡 How Spaced Repetition Works</span>
          {showHowItWorks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showHowItWorks && (
          <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#22C55E', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>1.</span>
                <span>After solving a problem, it automatically enters your revision queue.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#22C55E', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>2.</span>
                <span>You'll be prompted to review it at <strong>Day 1, 3, 7, 15, and 30</strong>.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#22C55E', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>3.</span>
                <span>Rate yourself: <span style={{ color: '#22C55E' }}>Easy</span> (strong recall), <span style={{ color: '#fbbf24' }}>Hard</span> (needs more practice), <span style={{ color: '#f87171' }}>Forgot</span> (re-scheduled from scratch).</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#22C55E', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>4.</span>
                <span>After completing all 5 reviews as Easy, the problem is <strong style={{ color: '#22C55E' }}>Mastered</strong>! 🏆</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RevisionPage
