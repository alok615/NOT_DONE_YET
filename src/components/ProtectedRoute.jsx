// ============================================
// !doneyet — Route Protection Components
// ============================================

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ── Protected Route — requires auth + profile ──
export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated, hasProfile } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
        color: '#22C55E',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '1.2rem',
        gap: '12px',
      }}>
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

// ── Guest Route — allows both authenticated and unauthenticated users ──
export function GuestRoute({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
        color: '#22C55E',
        fontFamily: 'var(--font-mono, monospace)',
      }}>
        <div className="spinner" />
      </div>
    )
  }

  return children
}
