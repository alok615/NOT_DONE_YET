// ============================================
// !doneyet — FAB Menu (replaces sidebar)
// Coffee man icon → expands with nav options
// ============================================

import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  Users,
  MessageCircle,
  Sun,
  Moon,
  Eye,
  EyeOff,
  LogOut,
  LogIn,
  Ghost,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useAppStore from '../store/appStore'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/friends', label: 'Friends', icon: Users },
  { path: '/chat', label: 'Who Cares', icon: MessageCircle },
]

function FabMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { userProfile, isAuthenticated, logout, updateProfile } = useAuth()
  const { theme, toggleTheme } = useAppStore()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [ghostMode, setGhostMode] = useState(userProfile?.ghostMode || false)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on route change
  const handleNav = () => setIsOpen(false)

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/login')
  }

  const handleGhostToggle = async () => {
    const newMode = !ghostMode
    setGhostMode(newMode)
    try {
      if (updateProfile) await updateProfile({ ghostMode: newMode })
    } catch (err) {
      console.warn('Ghost mode error:', err)
    }
  }

  return (
    <div className="fab-menu" ref={menuRef}>
      {/* Expanded Menu */}
      {isOpen && (
        <div className="fab-popup">
          {/* Navigation */}
          <div className="fab-section">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `fab-item ${isActive ? 'active' : ''}`}
                onClick={handleNav}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="fab-divider" />

          {/* Settings */}
          <div className="fab-section">
            <button className="fab-item" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {isAuthenticated && (
              <button className="fab-item" onClick={handleGhostToggle}>
                {ghostMode ? <Ghost size={18} /> : <Eye size={18} />}
                <span>Ghost Mode {ghostMode ? 'ON' : 'OFF'}</span>
                {ghostMode && <span className="fab-badge">👻</span>}
              </button>
            )}
          </div>

          <div className="fab-divider" />

          {/* Auth */}
          <div className="fab-section">
            {isAuthenticated ? (
              <>
                {userProfile && (
                  <div className="fab-profile">
                    <div className="avatar avatar-sm">
                      {userProfile.photoURL ? (
                        <img src={userProfile.photoURL} alt="" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{(userProfile.displayName || '?')[0]}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                        {userProfile.displayName}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        @{userProfile.username}
                      </div>
                    </div>
                  </div>
                )}
                <button className="fab-item danger" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <NavLink to="/login" className="fab-item accent" onClick={handleNav}>
                <LogIn size={18} />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </div>
      )}

      {/* FAB Button — Coffee Guy ☕ */}
      <button
        className={`fab-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <span className="fab-coffee-icon" role="img" aria-label="menu">☕</span>
        )}
      </button>
    </div>
  )
}

export default FabMenu
