// ============================================
// !doneyet — Top Bar (Clean, Minimal)
// ============================================

import { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Search, X, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useAppStore from '../store/appStore'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/revision': 'Revision',
}

function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userProfile, isAuthenticated, logout } = useAuth()
  const { searchQuery, setSearchQuery, getStats } = useAppStore()
  const stats = getStats()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    setShowDropdown(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
          }}>
            <span style={{ color: '#22C55E' }}>!</span>
            <span style={{ color: 'var(--text-primary)' }}>doneyet</span>
          </span>
        </Link>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search */}
        <div className="search-container" style={{ maxWidth: 300, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search problems, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
            style={{ paddingLeft: 36, paddingRight: searchQuery ? 32 : 12 }}
          />
          {searchQuery && (
            <button
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <span style={{
          fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)',
          padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)',
        }}>⌘K</span>

        {/* Notification bell */}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', position: 'relative', padding: 4,
        }}>
          <Bell size={20} />
        </button>

        {/* User avatar + dropdown */}
        {isAuthenticated && userProfile ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
                background: 'linear-gradient(135deg, #22C55E, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0,
              }}>
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                ) : (
                  (userProfile.displayName || 'U')[0].toUpperCase()
                )}
              </div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                {userProfile.displayName || userProfile.username}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                width: 200, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                overflow: 'hidden', zIndex: 100,
              }}>
                <button onClick={() => { setShowDropdown(false) }} style={dropdownItemStyle}>
                  <User size={16} /> Profile
                </button>
                <button onClick={() => { setShowDropdown(false) }} style={dropdownItemStyle}>
                  <Settings size={16} /> Settings
                </button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#ef4444' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            fontSize: 'var(--text-sm)', color: '#22C55E', textDecoration: 'none',
            fontWeight: 500, display: 'flex', alignItems: 'center', padding: '0 8px', whiteSpace: 'nowrap'
          }}>
            Sign In
          </Link>
        )}

        {/* Progress count */}
        <div style={{
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#22C55E',
          fontWeight: 600,
        }}>
          {stats.completed}/{stats.total}
        </div>
      </div>
    </header>
  )
}

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '10px 14px', background: 'none', border: 'none',
  color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer',
  textAlign: 'left', transition: 'background 0.15s',
}

export default TopBar
