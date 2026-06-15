import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

export default function LoginPage() {
  const { isAuthenticated, hasProfile, loginWithGoogle, loginWithGithub, loginAsGuest, authError, clearError, offlineMode } = useAuth()
  const navigate = useNavigate()
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated && hasProfile) navigate('/dashboard', { replace: true })
    else if (isAuthenticated && !hasProfile) navigate('/onboarding', { replace: true })
  }, [isAuthenticated, hasProfile, navigate])

  useEffect(() => {
    if (authError) {
      toast.error(authError)
      clearError()
      setIsSigningIn(false)
    }
  }, [authError, clearError])

  const handleGoogleLogin = async () => {
    try { setIsSigningIn(true); await loginWithGoogle() } catch { setIsSigningIn(false) }
  }
  const handleGithubLogin = async () => {
    try { setIsSigningIn(true); await loginWithGithub() } catch { setIsSigningIn(false) }
  }
  const handleGuestLogin = async () => {
    try { setIsSigningIn(true); await loginAsGuest() } catch { setIsSigningIn(false) }
  }

  return (
    <>
      <style>{`
        @keyframes gridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes waveFlow1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveFlow2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveFlow3 {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(-75%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 13px 20px;
          border-radius: 12px;
          font-family: var(--font-sans, 'Inter', sans-serif);
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255,255,255,0.1);
          outline: none;
        }
        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(34,197,94,0.15);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        .login-btn-dark {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .login-btn-dark:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .login-btn-green {
          background: linear-gradient(135deg, #22C55E, #16a34a);
          color: #000;
          border: none;
        }
        .login-btn-green:hover {
          background: linear-gradient(135deg, #2dd468, #22C55E);
          box-shadow: 0 4px 24px rgba(34,197,94,0.3);
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'fixed',
            inset: '-60px',
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridScroll 8s linear infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Terminal prompt */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 28,
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: '0.85rem',
            color: '#22C55E',
            letterSpacing: '0.04em',
            zIndex: 2,
          }}
        >
          user@codegrid:~$
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px 180px',
            zIndex: 1,
            width: '100%',
            maxWidth: 440,
            animation: 'fadeInUp 0.6s ease',
          }}
        >
          {/* Coffee man illustration */}
          <img
            src={new URL('../assets/coffee-man.jpg', import.meta.url).href}
            alt="Coffee man illustration"
            style={{
              maxWidth: 400,
              width: '100%',
              height: 'auto',
              marginBottom: 28,
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />

          {/* Login card */}
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 16,
              padding: 32,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Card content */}

            <h1
              style={{
                color: '#fff',
                fontSize: '1.6rem',
                fontWeight: 700,
                textAlign: 'center',
                margin: '0 0 6px',
                fontFamily: 'var(--font-sans, "Inter", sans-serif)',
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.88rem',
                textAlign: 'center',
                margin: '0 0 28px',
                fontFamily: 'var(--font-sans, "Inter", sans-serif)',
              }}
            >
              Login to continue your journey
            </p>

            {/* Google */}
            <button
              className="login-btn login-btn-dark"
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              className="login-btn login-btn-dark"
              onClick={handleGithubLogin}
              disabled={isSigningIn}
              style={{ marginTop: 12 }}
            >
              <GithubIcon />
              Continue with GitHub
            </button>

            {/* OR divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                margin: '22px 0',
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  fontFamily: 'var(--font-sans, "Inter", sans-serif)',
                }}
              >
                OR
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Guest */}
            <button
              className="login-btn login-btn-green"
              onClick={handleGuestLogin}
              disabled={isSigningIn}
            >
              Continue as Guest
            </button>


          </div>

          {/* Feature items */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 28,
              marginTop: 36,
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: '🔄', title: 'Track Progress', sub: 'Monitor your DSA journey' },
            ].map((feat) => (
              <div
                key={feat.title}
                style={{
                  textAlign: 'center',
                  flex: '0 1 150px',
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{feat.icon}</div>
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-sans, "Inter", sans-serif)',
                    marginBottom: 2,
                  }}
                >
                  {feat.title}
                </div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-sans, "Inter", sans-serif)',
                  }}
                >
                  {feat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-sans, "Inter", sans-serif)',
            paddingBottom: 160,
          }}
        >
          © 2025 CodeGrid. All rights reserved.
        </div>

        {/* Pulsing red dot */}
        <div
          style={{
            position: 'absolute',
            right: 32,
            bottom: 170,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ef4444',
            animation: 'pulse 2s ease-in-out infinite',
            zIndex: 3,
          }}
        />

        {/* Animated waveform */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 150,
            overflow: 'hidden',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          {/* Wave layer 1 */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              width: '200%',
              height: 150,
              animation: 'waveFlow1 12s linear infinite',
            }}
            viewBox="0 0 2400 150"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 C150,40 350,120 600,80 C850,40 1050,120 1200,80 C1350,40 1550,120 1800,80 C2050,40 2250,120 2400,80 L2400,150 L0,150 Z"
              fill="rgba(34,197,94,0.12)"
            />
          </svg>

          {/* Wave layer 2 */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              width: '200%',
              height: 130,
              animation: 'waveFlow2 16s linear infinite',
            }}
            viewBox="0 0 2400 130"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C200,100 400,30 600,70 C800,110 1000,40 1200,60 C1400,100 1600,30 1800,70 C2000,110 2200,40 2400,60 L2400,130 L0,130 Z"
              fill="rgba(34,197,94,0.08)"
            />
          </svg>

          {/* Wave layer 3 */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              width: '200%',
              height: 100,
              animation: 'waveFlow3 20s linear infinite',
            }}
            viewBox="0 0 2400 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 C100,20 300,80 500,50 C700,20 900,80 1200,50 C1400,20 1600,80 1800,50 C2000,20 2200,80 2400,50 L2400,100 L0,100 Z"
              fill="rgba(34,197,94,0.18)"
            />
          </svg>

          {/* Wave layer 4 - terrain base */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              width: '200%',
              height: 60,
              animation: 'waveFlow1 25s linear infinite',
            }}
            viewBox="0 0 2400 60"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 C300,10 600,50 900,25 C1200,5 1500,45 1800,30 C2100,10 2300,40 2400,30 L2400,60 L0,60 Z"
              fill="rgba(34,197,94,0.25)"
            />
          </svg>
        </div>
      </div>
    </>
  )
}
