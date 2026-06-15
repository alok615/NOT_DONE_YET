// ============================================
// !doneyet — App Root Component
// ============================================

import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import TopicPage from './pages/TopicPage'
import RevisionPage from './pages/RevisionPage'

// Components
import SplashScreen from './components/SplashScreen'
import TopBar from './components/TopBar'
import SidebarDrawer from './components/SidebarDrawer'
import OnboardingTour from './components/OnboardingTour'
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

// ── App Layout (dashboard pages — topbar + sidebar drawer FAB) ──
function AppLayout({ children }) {
  const { userProfile, updateProfile } = useAuth()
  const showTour = userProfile && userProfile.hasSeenOnboardingTour === false

  const handleTourComplete = async () => {
    try {
      await updateProfile({ hasSeenOnboardingTour: true })
    } catch (err) {
      console.warn('Tour complete update failed:', err)
    }
  }

  return (
    <div className="app-layout no-sidebar">
      <div className="main-content full-width">
        <TopBar />
        {children}
      </div>
      <SidebarDrawer />
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    </div>
  )
}

// ── Main App ──
function App() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Dashboard — accessible to guests and authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Topic Pages — accessible to all */}
      <Route
        path="/topic/:slug"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TopicPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Revision — accessible to all */}
      <Route
        path="/revision"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RevisionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />



      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
