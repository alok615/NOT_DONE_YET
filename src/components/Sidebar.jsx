// ============================================
// !doneyet — Sidebar Navigation
// ============================================

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Eye,
  EyeOff,
  LogOut,
  Ghost,
  Menu,
  X,
  LogIn,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useAppStore from '../store/appStore'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/friends', label: 'Friends', icon: Users },
  { path: '/chat', label: 'Who Cares', icon: MessageCircle },
]

function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
    theme,
    toggleTheme,
  } = useAppStore()
  const { userProfile, isAuthenticated, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [ghostMode, setGhostMode] = useState(userProfile?.ghostMode || false)

  const handleGhostToggle = async () => {
    const newMode = !ghostMode
    setGhostMode(newMode)
    try {
      if (userProfile && updateProfile) {
        await updateProfile({ ghostMode: newMode })
      }
    } catch (err) {
      console.warn('Ghost mode update failed:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0"
          style={{
            background: 'var(--bg-overlay)',
            zIndex: 'calc(var(--z-sidebar) - 1)',
            display: 'none',
          }}
          onClick={() => setSidebarOpen(false)}
          // Show only on mobile via CSS
          id="sidebar-overlay"
        />
      )}

      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-logo">
            <span className="sidebar-logo-text">
              <span className="sidebar-logo-bang">!</span>
              {!sidebarCollapsed && <span className="sidebar-logo-name">doneyet</span>}
            </span>
          </NavLink>
          <button
            className="btn-icon"
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ display: 'none' }}
            id="sidebar-collapse-btn"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {/* Mobile close */}
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            id="sidebar-close-btn"
            style={{ display: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!sidebarCollapsed && (
            <div className="sidebar-section-label">Navigation</div>
          )}

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} className="sidebar-nav-icon" />
              {!sidebarCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}
              {item.path === '/chat' && !sidebarCollapsed && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--accent-cyan)',
                  marginLeft: 'auto',
                  fontWeight: 'var(--font-medium)',
                }}>AI</span>
              )}
            </NavLink>
          ))}

          {/* Account Section */}
          {!sidebarCollapsed && (
            <div className="sidebar-section-label" style={{ marginTop: 'var(--space-4)' }}>
              Settings
            </div>
          )}

          {/* Ghost Mode Toggle */}
          {isAuthenticated && (
            <button
              className={`sidebar-nav-item ${ghostMode ? 'active' : ''}`}
              onClick={handleGhostToggle}
              title={ghostMode ? 'Ghost mode ON — hidden from leaderboard' : 'Ghost mode OFF'}
            >
              {ghostMode ? (
                <Ghost size={20} className={`sidebar-nav-icon ${ghostMode ? 'animate-ghost' : ''}`} />
              ) : (
                <Eye size={20} className="sidebar-nav-icon" />
              )}
              {!sidebarCollapsed && (
                <>
                  <span className="sidebar-nav-label">Ghost Mode</span>
                  <div
                    className={`toggle ${ghostMode ? 'active' : ''}`}
                    style={{ marginLeft: 'auto', width: 36, height: 20 }}
                  >
                    <div className="toggle-knob" style={{ width: 14, height: 14 }} />
                  </div>
                </>
              )}
            </button>
          )}

          {/* Theme Toggle */}
          <button
            className="sidebar-nav-item"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="sidebar-nav-icon" />
            ) : (
              <Moon size={20} className="sidebar-nav-icon" />
            )}
            {!sidebarCollapsed && (
              <span className="sidebar-nav-label">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </nav>

        {/* Spacer */}
        <div className="sidebar-spacer" />

        {/* Footer — Profile */}
        <div className="sidebar-footer">
          {isAuthenticated && userProfile ? (
            <div className="sidebar-profile">
              <div className={`avatar avatar-sm ${ghostMode ? 'avatar-ghost' : ''}`}>
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.displayName} referrerPolicy="no-referrer" />
                ) : (
                  getInitials(userProfile.displayName)
                )}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="sidebar-profile-info">
                    <div className="sidebar-profile-name">{userProfile.displayName}</div>
                    <div className="sidebar-profile-email">@{userProfile.username}</div>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={handleLogout}
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="sidebar-nav-item"
              style={{ color: 'var(--accent-purple-light)' }}
            >
              <LogIn size={20} className="sidebar-nav-icon" />
              {!sidebarCollapsed && <span className="sidebar-nav-label">Sign In</span>}
            </NavLink>
          )}
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          #sidebar-overlay { display: block !important; }
          #sidebar-close-btn { display: flex !important; }
          #sidebar-collapse-btn { display: none !important; }
        }
        @media (min-width: 1025px) {
          #sidebar-collapse-btn { display: flex !important; }
          #sidebar-close-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}

export default Sidebar
