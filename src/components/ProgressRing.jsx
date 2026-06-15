// ============================================
// !doneyet — ProgressRing Component
// ============================================

import { useMemo } from 'react'

export default function ProgressRing({
  size = 64,
  strokeWidth = 4,
  progress = 0,
  color = 'url(#progressGradient)',
  label,
}) {
  const { radius, circumference, offset } = useMemo(() => {
    const r = (size - strokeWidth) / 2
    const c = 2 * Math.PI * r
    const clampedProgress = Math.min(100, Math.max(0, progress))
    const o = c - (clampedProgress / 100) * c
    return { radius: r, circumference: c, offset: o }
  }, [size, strokeWidth, progress])

  const center = size / 2
  const fontSize = size * 0.22
  const labelFontSize = size * 0.14

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="progress-ring"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${Math.round(progress)}%` : `${Math.round(progress)}% complete`}
    >
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-purple)" />
          <stop offset="100%" stopColor="var(--accent-cyan)" />
        </linearGradient>
      </defs>

      {/* Track circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--border-primary)"
        strokeWidth={strokeWidth}
      />

      {/* Progress circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        className="animate-progress"
        style={{
          '--progress-circumference': circumference,
          '--progress-offset': offset,
        }}
      />

      {/* Percentage text */}
      <text
        x={center}
        y={label ? center - labelFontSize * 0.3 : center}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontFamily="var(--font-mono)"
        fontWeight="var(--font-bold)"
        fontSize={fontSize}
      >
        {Math.round(progress)}%
      </text>

      {/* Optional label */}
      {label && (
        <text
          x={center}
          y={center + fontSize * 0.7}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-tertiary)"
          fontSize={labelFontSize}
        >
          {label}
        </text>
      )}
    </svg>
  )
}
