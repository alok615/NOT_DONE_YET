import { useState, useEffect, useCallback } from 'react'

const PHASES = ['bang', 'slide', 'type', 'reveal', 'done']
const TYPING_TEXT = 'DONE YET'
const TYPING_SPEED = 70
const BLINK_DURATION = 1500
const SLIDE_DURATION = 500
const REVEAL_DELAY = 500
const DONE_DELAY = 2000

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('bang')
  const [typedCount, setTypedCount] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  // Phase sequencing
  useEffect(() => {
    let timeout

    if (phase === 'bang') {
      timeout = setTimeout(() => setPhase('slide'), BLINK_DURATION)
    } else if (phase === 'slide') {
      timeout = setTimeout(() => setPhase('type'), SLIDE_DURATION)
    } else if (phase === 'type') {
      if (typedCount < TYPING_TEXT.length) {
        timeout = setTimeout(() => setTypedCount(prev => prev + 1), TYPING_SPEED)
      } else {
        timeout = setTimeout(() => setPhase('reveal'), 200)
      }
    } else if (phase === 'reveal') {
      timeout = setTimeout(() => setPhase('done'), REVEAL_DELAY)
    } else if (phase === 'done') {
      timeout = setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          onFinish()
        }, 500) // CSS transition takes 500ms
      }, DONE_DELAY)
    }

    return () => clearTimeout(timeout)
  }, [phase, typedCount, onFinish])

  const showSlide = phase === 'slide' || phase === 'type' || phase === 'reveal' || phase === 'done'
  const showTyping = phase === 'type' || phase === 'reveal' || phase === 'done'
  const showReveal = phase === 'reveal' || phase === 'done'

  return (
    <>
      <style>{`
        @keyframes bangBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes gridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes terminalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: '-60px',
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridScroll 8s linear infinite',
            pointerEvents: 'none',
          }}
        />


        {/* Coffee man illustration */}
        <img
          src={new URL('../assets/coffee-man.jpg', import.meta.url).href}
          alt="Coffee man"
          style={{
            maxWidth: 360,
            width: '100%',
            height: 'auto',
            marginBottom: 32,
            display: 'block',
            animation: 'fadeInUp 0.8s ease forwards',
            zIndex: 1,
          }}
          onError={(e) => { e.target.style.display = 'none' }}
        />

        {/* Main logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            height: '5rem', // Fixed height to prevent jumping
          }}
        >
          {/* The ! character */}
          <span
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontWeight: 900,
              fontSize: '5rem',
              color: '#22C55E',
              textShadow: '0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.3), 0 0 80px rgba(34,197,94,0.15)',
              lineHeight: 1,
              display: 'inline-block',
              animation: phase === 'bang' ? 'bangBlink 0.5s step-end 3' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            !
          </span>

          {/* Typed text */}
          {showTyping && (
            <span
              style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontWeight: 800,
                fontSize: '4rem',
                color: '#ffffff',
                letterSpacing: '0.08em',
                lineHeight: 1,
                marginLeft: 16,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {TYPING_TEXT.slice(0, typedCount)}
              <span
                style={{
                  display: 'inline-block',
                  width: '4px',
                  height: '3.5rem',
                  background: '#22C55E',
                  marginLeft: 8,
                  animation: 'cursorBlink 0.7s step-end infinite',
                }}
              />
            </span>
          )}
        </div>

        {/* Tagline */}
        {showReveal && (
          <div
            style={{
              marginTop: 28,
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.12em',
              animation: 'fadeInUp 0.7s ease forwards',
              zIndex: 1,
            }}
          >
            Track. Solve. Improve.{' '}
            <span style={{ color: '#22C55E', fontWeight: 700 }}>Repeat.</span>
          </div>
        )}
      </div>
    </>
  )
}
