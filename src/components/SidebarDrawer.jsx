// ============================================
// !doneyet — Sidebar Drawer (replaces Sidebar + FabMenu)
// Coffee man FAB → slides in right drawer
// ============================================

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  RotateCcw,
  BarChart3,
  Bookmark,
  Sun,
  Moon,
  Ghost,
  Eye,
  LogOut,
  LogIn,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useAppStore from '../store/appStore'
import coffeManImg from '../assets/coffee-man.png'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/problems', label: 'Problems', icon: Code2, fallback: '/dashboard' },
  { path: '/topics', label: 'Topics', icon: BookOpen, fallback: '/dashboard' },
  { path: '/revision', label: 'Revision', icon: RotateCcw },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, fallback: '/dashboard' },
  { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark, fallback: '/dashboard' },
]

function SidebarDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { userProfile, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleClose = () => setIsOpen(false)

  const handleNavClick = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/login')
  }

  const streak = userProfile?.streak || 0

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 54,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 280,
          background: '#0a0a0a',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          zIndex: 55,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ color: '#22C55E' }}>!</span>
          <span style={{ color: '#fff' }}>doneyet</span>
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '12px 8px' }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              padding: '4px 12px 8px',
            }}
          >
            Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const to = item.fallback || item.path
            return (
              <NavLink
                key={item.path}
                to={to}
                className={({ isActive }) =>
                  `sidebar-drawer-item ${isActive ? 'sidebar-drawer-item-active' : ''}`
                }
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? '#22C55E' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                })}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>



        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom Section */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {isAuthenticated && userProfile ? (
            <>
              {/* Profile Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                  padding: '8px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{userProfile.avatar || (userProfile.displayName || '?')[0]}</span>
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userProfile.displayName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    @{userProfile.username}
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#ef4444',
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.12)',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: 12,
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={handleNavClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#22C55E',
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.12)',
                textDecoration: 'none',
                marginBottom: 12,
              }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </NavLink>
          )}

          {/* Streak Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              background: streak > 0 ? 'rgba(251,146,60,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${streak > 0 ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.06)'}`,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: streak > 0 ? '#fb923c' : 'rgba(255,255,255,0.4)',
            }}
          >
            <span>🔥</span>
            <span>{streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 55,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: isOpen
            ? '2px solid rgba(239,68,68,0.4)'
            : '2px solid rgba(34,197,94,0.3)',
          background: isOpen ? '#1a1a1a' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: isOpen
            ? '0 0 20px rgba(239,68,68,0.15)'
            : '0 0 20px rgba(34,197,94,0.1)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.boxShadow = '0 0 25px rgba(34,197,94,0.25)'
            e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.1)'
            e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
          }
        }}
      >
        {isOpen ? (
          <X size={24} color="#ef4444" />
        ) : (
          <img
            src={coffeManImg}
            alt="Menu"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        )}
      </button>
    </>
  )
}

export default SidebarDrawer
