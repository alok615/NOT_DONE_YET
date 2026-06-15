// ============================================
// !doneyet — Monthly Activity Heatmap
// Full-month calendar view with navigation
// ============================================

import { useState, useMemo, useCallback } from 'react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const LEVEL_COLORS = [
  '#1a1a1a', // 0 — no activity
  '#0e4429', // 1
  '#006d32', // 2
  '#26a641', // 3
  '#39d353', // 4+
]

function getLevel(count) {
  if (!count || count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isSameMonth(year, month) {
  const now = new Date()
  return year === now.getFullYear() && month === now.getMonth()
}

function isFutureMonth(year, month) {
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth()
  return year > nowYear || (year === nowYear && month > nowMonth)
}

function getTodayStr() {
  const d = new Date()
  return formatDate(d.getFullYear(), d.getMonth(), d.getDate())
}

export default function WeeklyHeatmap({
  activityData = {},
  isExpanded = false,
  onToggleExpand,
}) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [hoveredCell, setHoveredCell] = useState(null)

  const todayStr = getTodayStr()

  // ── Navigation ────────────────────────────
  const canGoNext = !isSameMonth(viewYear, viewMonth) && !isFutureMonth(viewYear, viewMonth)

  const goToPrev = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const goToNext = useCallback(() => {
    if (!canGoNext) return
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [canGoNext])

  // ── Build calendar grid ───────────────────
  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    // getDay() returns 0=Sun. We want Mon=0, so shift.
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6 // Sunday becomes 6

    const weeks = []
    let currentWeek = []

    // Pad leading empty cells
    for (let i = 0; i < startDow; i++) {
      currentWeek.push(null)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(viewYear, viewMonth, day)
      const cellDate = new Date(viewYear, viewMonth, day)
      const isFuture = cellDate > today
      const count = activityData[dateStr] || 0

      currentWeek.push({
        day,
        dateStr,
        count: isFuture ? -1 : count,
        level: isFuture ? -1 : getLevel(count),
        isFuture,
        isToday: dateStr === todayStr,
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // Pad trailing empty cells
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [viewYear, viewMonth, activityData, todayStr])

  // ── Sizing ────────────────────────────────
  const cellSize = isExpanded ? 48 : 36
  const cellGap = isExpanded ? 4 : 3
  const fontSize = isExpanded ? 11 : 9
  const headerFontSize = isExpanded ? 13 : 11

  // ── Styles ────────────────────────────────
  const containerStyle = {
    fontFamily: 'var(--font-mono)',
    userSelect: 'none',
    width: '100%',
  }

  const navBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isExpanded ? 16 : 10,
    position: 'relative',
  }

  const navBtnStyle = (enabled) => ({
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: enabled ? 'var(--text-primary)' : 'rgba(255,255,255,0.15)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: isExpanded ? 18 : 14,
    width: isExpanded ? 34 : 28,
    height: isExpanded ? 34 : 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    opacity: enabled ? 1 : 0.4,
  })

  const monthLabelStyle = {
    color: 'var(--text-primary)',
    fontSize: isExpanded ? 18 : 14,
    fontWeight: 600,
    letterSpacing: '-0.02em',
  }

  const expandBtnStyle = {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    fontSize: isExpanded ? 16 : 13,
    width: isExpanded ? 34 : 28,
    height: isExpanded ? 34 : 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    marginLeft: 6,
  }

  const gridContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: cellGap,
  }

  const dayHeaderRowStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(7, ${cellSize}px)`,
    gap: cellGap,
    justifyContent: 'center',
    marginBottom: isExpanded ? 6 : 4,
  }

  const dayHeaderCellStyle = {
    textAlign: 'center',
    color: 'var(--text-tertiary)',
    fontSize: headerFontSize,
    fontWeight: 500,
    lineHeight: `${cellSize * 0.6}px`,
    letterSpacing: '0.02em',
  }

  const weekRowStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(7, ${cellSize}px)`,
    gap: cellGap,
    justifyContent: 'center',
  }

  const getCellStyle = (cell, isHovered) => {
    if (!cell) {
      return {
        width: cellSize,
        height: cellSize,
        borderRadius: 6,
        backgroundColor: 'transparent',
      }
    }

    const { isFuture, isToday, level } = cell

    return {
      width: cellSize,
      height: cellSize,
      borderRadius: 6,
      backgroundColor: isFuture ? 'rgba(255,255,255,0.02)' : LEVEL_COLORS[level],
      opacity: isFuture ? 0.3 : 1,
      border: isToday ? '2px solid #22C55E' : '1px solid rgba(255,255,255,0.04)',
      cursor: 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      transform: isHovered && !isFuture ? 'scale(1.12)' : 'scale(1)',
      boxShadow: isHovered && !isFuture ? '0 0 12px rgba(34,197,94,0.25)' : 'none',
      boxSizing: 'border-box',
    }
  }

  const dateNumStyle = (cell) => ({
    fontSize,
    fontWeight: cell?.isToday ? 700 : 400,
    color: cell?.isFuture
      ? 'rgba(255,255,255,0.15)'
      : cell?.level >= 3
        ? 'rgba(0,0,0,0.5)'
        : 'rgba(255,255,255,0.45)',
    lineHeight: 1,
    pointerEvents: 'none',
  })

  const tooltipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 6,
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    padding: '5px 10px',
    fontSize: 11,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 100,
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  }

  const legendContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: isExpanded ? 5 : 4,
    marginTop: isExpanded ? 16 : 10,
  }

  const legendLabelStyle = {
    color: 'var(--text-tertiary)',
    fontSize: isExpanded ? 11 : 9,
    fontWeight: 500,
  }

  const legendSwatchStyle = (color) => ({
    width: isExpanded ? 14 : 10,
    height: isExpanded ? 14 : 10,
    borderRadius: 3,
    backgroundColor: color,
  })

  // ── Render ────────────────────────────────
  return (
    <div style={containerStyle}>
      {/* Navigation bar */}
      <div style={navBarStyle}>
        <button
          onClick={goToPrev}
          style={navBtnStyle(true)}
          aria-label="Previous month"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.background = 'none'
          }}
        >
          ‹
        </button>

        <span style={monthLabelStyle}>
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            style={navBtnStyle(canGoNext)}
            aria-label="Next month"
            onMouseEnter={(e) => {
              if (canGoNext) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = 'none'
            }}
          >
            ›
          </button>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              style={expandBtnStyle}
              aria-label={isExpanded ? 'Collapse heatmap' : 'Expand heatmap'}
              title={isExpanded ? 'Collapse' : 'Expand'}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-green)'
                e.currentTarget.style.color = 'var(--accent-green)'
                e.currentTarget.style.background = 'rgba(34,197,94,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'var(--text-tertiary)'
                e.currentTarget.style.background = 'none'
              }}
            >
              ⛶
            </button>
          )}
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={dayHeaderRowStyle}>
        {DAY_HEADERS.map((d) => (
          <div key={d} style={dayHeaderCellStyle}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={gridContainerStyle}>
        {calendarWeeks.map((week, wi) => (
          <div key={wi} style={weekRowStyle}>
            {week.map((cell, ci) => {
              const key = cell ? cell.dateStr : `empty-${wi}-${ci}`
              const isHovered = hoveredCell === key

              return (
                <div
                  key={key}
                  style={{
                    ...getCellStyle(cell, isHovered),
                    position: 'relative',
                  }}
                  onMouseEnter={() => cell && setHoveredCell(key)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {/* Date number */}
                  {cell && (
                    <span style={dateNumStyle(cell)}>{cell.day}</span>
                  )}

                  {/* Tooltip */}
                  {cell && isHovered && !cell.isFuture && (
                    <div style={tooltipStyle}>
                      {cell.dateStr}: {cell.count} problem{cell.count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={legendContainerStyle}>
        <span style={{ ...legendLabelStyle, marginRight: 2 }}>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div
            key={i}
            style={legendSwatchStyle(color)}
            title={`Level ${i}`}
          />
        ))}
        <span style={{ ...legendLabelStyle, marginLeft: 2 }}>More</span>
      </div>
    </div>
  )
}
