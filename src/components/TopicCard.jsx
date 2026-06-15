// ============================================
// !doneyet — TopicCard Component
// ============================================

import {
  BookOpen,
  ArrowUpDown,
  LayoutGrid,
  Search,
  Type,
  Link2,
  RefreshCw,
  Binary,
  Layers,
  Crosshair,
  Triangle,
  Zap,
  GitBranch,
  GitFork,
  Share2,
  Brain,
  Network,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import ProgressRing from './ProgressRing'

// Map topic headings to lucide-react icons
const TOPIC_ICON_MAP = {
  'Basics': BookOpen,
  'Sorting': ArrowUpDown,
  'Arrays': LayoutGrid,
  'Binary Search': Search,
  'Strings': Type,
  'Linked List': Link2,
  'Recursion': RefreshCw,
  'Bit Manipulation': Binary,
  'Stack & Queue': Layers,
  'Two Pointers': Crosshair,
  'Heaps': Triangle,
  'Greedy': Zap,
  'Binary Tree': GitBranch,
  'Binary Search Tree': GitFork,
  'Graphs': Share2,
  'Dynamic Programming': Brain,
  'Tries': Network,
  'Strings (Part 2)': FileText,
}

// Accent color palette for cards (cycles through 6 colors)
const ACCENT_COLORS = [
  { bg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.3)', text: '#a78bfa' },  // purple
  { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)', text: '#22d3ee' },    // cyan
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399' },   // green
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },   // amber
  { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },     // red
  { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },   // blue
]

function getTopicIcon(heading) {
  // Try exact match first
  if (TOPIC_ICON_MAP[heading]) return TOPIC_ICON_MAP[heading]

  // Try partial match
  for (const [key, icon] of Object.entries(TOPIC_ICON_MAP)) {
    if (heading.toLowerCase().includes(key.toLowerCase())) return icon
  }

  return BookOpen // fallback
}

export default function TopicCard({ topic, index, onClick }) {
  const totalQuestions = topic.contentTotalQuestions
  const completedQuestions = topic.contentCompletedQuestions
  const percentage = totalQuestions > 0
    ? Math.round((completedQuestions / totalQuestions) * 100)
    : 0
  const isComplete = percentage === 100

  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]
  const Icon = getTopicIcon(topic.contentHeading)

  const buttonLabel = completedQuestions === 0 ? 'Start' : 'Continue'

  return (
    <div
      className="card card-hover card-accent stagger-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${topic.contentHeading} — ${completedQuestions} of ${totalQuestions} solved`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      style={{
        padding: 'var(--space-5)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Completed badge */}
      {isComplete && (
        <div
          className="badge badge-success"
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          <CheckCircle2 size={12} />
          Done
        </div>
      )}

      {/* Top: Icon + Heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-lg)',
            background: accent.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} style={{ color: accent.text }} />
        </div>
        <h3
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {topic.contentHeading}
        </h3>
      </div>

      {/* Middle: Progress Ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
        <ProgressRing
          size={72}
          strokeWidth={5}
          progress={percentage}
        />
      </div>

      {/* Bottom: Solved count + Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ fontWeight: 'var(--font-semibold)', color: accent.text }}>
            {completedQuestions}
          </span>
          {' / '}
          {totalQuestions} solved
        </span>
        <span
          className={`btn btn-sm ${completedQuestions === 0 ? 'btn-primary' : 'btn-secondary'}`}
          role="presentation"
        >
          {buttonLabel}
        </span>
      </div>
    </div>
  )
}
