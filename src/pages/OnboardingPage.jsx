// ============================================
// !doneyet — Onboarding Page (Multi-step)
// 3 steps: Username → Avatar → Daily Goal
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const AVATARS = ['😎', '🚀', '💻', '🎯', '🔥', '⚡', '🧠', '🎮']

const DAILY_GOALS = [
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
]

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export default function OnboardingPage() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    hasProfile,
    checkUsername,
    createProfile,
  } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [dailyGoal, setDailyGoal] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceRef = useRef(null)

  // Pre-fill username from displayName
  useEffect(() => {
    if (user?.displayName && !username) {
      const sanitized = user.displayName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20)
      setUsername(sanitized)
      // Trigger validation for pre-filled value
      if (USERNAME_REGEX.test(sanitized)) {
        setUsernameStatus('checking')
        const timer = setTimeout(async () => {
          try {
            const available = await checkUsername(sanitized)
            setUsernameStatus(available ? 'available' : 'taken')
          } catch {
            setUsernameStatus(null)
          }
        }, 400)
        return () => clearTimeout(timer)
      }
    }
  }, [user?.displayName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Validate username with debounce
  const validateUsername = useCallback(
    (value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      const trimmed = value.trim()
      if (!trimmed) {
        setUsernameStatus(null)
        return
      }

      if (!USERNAME_REGEX.test(trimmed)) {
        setUsernameStatus('invalid')
        return
      }

      setUsernameStatus('checking')
      debounceRef.current = setTimeout(async () => {
        try {
          const available = await checkUsername(trimmed)
          setUsernameStatus(available ? 'available' : 'taken')
        } catch {
          setUsernameStatus(null)
          toast.error('Failed to check username')
        }
      }, 400)
    },
    [checkUsername]
  )

  const handleUsernameChange = (e) => {
    const val = e.target.value
    setUsername(val)
    validateUsername(val)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      await createProfile({
        username: username.trim(),
        displayName: user?.displayName || username.trim(),
        photoURL: user?.photoURL || null,
        avatar: selectedAvatar,
        dailyGoalTarget: dailyGoal,
      })
      toast.success('Welcome aboard! 🚀')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth guards
  if (authLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.spinner} />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (hasProfile) return <Navigate to="/dashboard" replace />

  const canProceedStep1 = usernameStatus === 'available'

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Progress Dots */}
        <div style={styles.progressDots}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: s === step ? '#22C55E' : 'transparent',
                border: `2px solid ${s === step ? '#22C55E' : 'rgba(255,255,255,0.2)'}`,
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h2 style={styles.title}>Choose your username</h2>

            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="e.g. dsa_warrior"
                maxLength={20}
                autoFocus
                autoComplete="off"
                style={{
                  ...styles.input,
                  borderColor:
                    usernameStatus === 'available'
                      ? 'rgba(34,197,94,0.5)'
                      : usernameStatus === 'taken' || usernameStatus === 'invalid'
                      ? 'rgba(239,68,68,0.5)'
                      : 'rgba(255,255,255,0.1)',
                }}
              />

              {/* Status Indicator */}
              <div style={styles.statusRow}>
                {usernameStatus === 'checking' && (
                  <span style={{ ...styles.statusText, color: 'rgba(255,255,255,0.4)' }}>
                    Checking...
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span style={{ ...styles.statusText, color: '#22C55E' }}>
                    ✓ Available
                  </span>
                )}
                {usernameStatus === 'taken' && (
                  <span style={{ ...styles.statusText, color: '#ef4444' }}>
                    ✗ Taken
                  </span>
                )}
                {usernameStatus === 'invalid' && (
                  <span style={{ ...styles.statusText, color: '#ef4444' }}>
                    ✗ 3–20 chars, alphanumeric + underscores only
                  </span>
                )}
                {usernameStatus === null && username.length === 0 && (
                  <span style={{ ...styles.statusText, color: 'rgba(255,255,255,0.3)' }}>
                    3–20 characters, letters, numbers &amp; underscores
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              style={{
                ...styles.primaryBtn,
                opacity: canProceedStep1 ? 1 : 0.4,
                cursor: canProceedStep1 ? 'pointer' : 'not-allowed',
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Avatar */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h2 style={styles.title}>Pick an avatar</h2>

            <div style={styles.avatarGrid}>
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `2px solid ${
                      selectedAvatar === avatar
                        ? '#22C55E'
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    fontSize: '1.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow:
                      selectedAvatar === avatar
                        ? '0 0 16px rgba(34,197,94,0.2)'
                        : 'none',
                    transform: selectedAvatar === avatar ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              style={styles.primaryBtn}
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 3: Daily Goal */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h2 style={styles.title}>Set your daily goal</h2>
            <p style={styles.subtitle}>
              How many problems do you want to solve per day?
            </p>

            <div style={styles.goalGrid}>
              {DAILY_GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setDailyGoal(goal.value)}
                  style={{
                    flex: 1,
                    padding: '16px 8px',
                    borderRadius: 12,
                    background:
                      dailyGoal === goal.value
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${
                      dailyGoal === goal.value
                        ? '#22C55E'
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: dailyGoal === goal.value ? '#22C55E' : '#fff',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {goal.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color:
                        dailyGoal === goal.value
                          ? 'rgba(34,197,94,0.7)'
                          : 'rgba(255,255,255,0.35)',
                      fontWeight: 500,
                    }}
                  >
                    per day
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                ...styles.primaryBtn,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
            >
              {isSubmitting ? 'Setting up...' : 'Get Started 🚀'}
            </button>
          </div>
        )}

        {/* Back button (steps 2 & 3) */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={styles.backBtn}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: '40px 32px',
    position: 'relative',
    boxShadow: '0 0 40px rgba(34,197,94,0.06)',
  },
  progressDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    fontFamily: 'var(--font-sans)',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.45)',
    margin: '-8px 0 0 0',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: '#fff',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  statusRow: {
    marginTop: 8,
    minHeight: 20,
  },
  statusText: {
    fontSize: '0.8125rem',
    fontWeight: 500,
  },
  primaryBtn: {
    width: '100%',
    padding: '14px 24px',
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
  backBtn: {
    position: 'absolute',
    bottom: 12,
    left: 32,
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    padding: '4px 0',
    fontWeight: 500,
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    width: '100%',
    justifyItems: 'center',
  },
  goalGrid: {
    display: 'flex',
    gap: 12,
    width: '100%',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(34,197,94,0.15)',
    borderTopColor: '#22C55E',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}
