// ============================================
// !doneyet — Onboarding Tour (First-time dashboard overlay)
// 5-slide flashcard carousel introducing features
// ============================================

import { useState } from 'react'

const SLIDES = [
  {
    icon: '📊',
    title: 'Track Every Solve',
    description:
      'Mark problems as solved and track your progress across 456+ DSA questions organized by topic.',
  },
  {
    icon: '🔄',
    title: 'Smart Revision',
    description:
      'Our spaced repetition system schedules reviews at Day 1, 3, 7, 15, and 30 to lock concepts in long-term memory.',
  },
  {
    icon: '🔥',
    title: 'Daily Goals & Streaks',
    description:
      'Set a daily solving target and build consistency. Watch your streak grow day by day.',
  },
]

export default function OnboardingTour({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const isLastSlide = currentSlide === SLIDES.length - 1
  const slide = SLIDES[currentSlide]

  const handleNext = () => {
    if (isLastSlide) {
      onComplete()
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        {/* Skip Button */}
        <button onClick={handleSkip} style={styles.skipBtn}>
          Skip
        </button>

        {/* Slide Content */}
        <div style={styles.slideContent} key={currentSlide}>
          <div style={styles.icon}>{slide.icon}</div>
          <h3 style={styles.title}>{slide.title}</h3>
          <p style={styles.description}>{slide.description}</p>
        </div>

        {/* Bottom: Dots + Next Button */}
        <div style={styles.bottomSection}>
          {/* Dot Indicators */}
          <div style={styles.dots}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i === currentSlide ? '#22C55E' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>

          {/* Next / Get Started Button */}
          <button onClick={handleNext} style={styles.nextBtn}>
            {isLastSlide ? 'Get Started' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backdropFilter: 'blur(4px)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#0a0a0a',
    borderRadius: 20,
    padding: 32,
    position: 'relative',
    border: '1px solid rgba(34,197,94,0.12)',
    boxShadow: '0 0 30px rgba(34,197,94,0.15)',
  },
  skipBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'color 0.15s ease',
  },
  slideContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '16px 0 24px',
    minHeight: 200,
  },
  icon: {
    fontSize: '3rem',
    marginBottom: 20,
    lineHeight: 1,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 12px 0',
    fontFamily: 'var(--font-sans)',
  },
  description: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: 340,
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  dots: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  nextBtn: {
    width: '100%',
    padding: '13px 24px',
    borderRadius: 12,
    background: '#22C55E',
    color: '#000',
    fontSize: '0.9375rem',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
  },
}
