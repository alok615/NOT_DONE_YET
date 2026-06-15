import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const DAILY_GOAL_OPTIONS = [
  { value: 1, label: '1', description: 'Steady' },
  { value: 3, label: '3', description: 'Regular' },
  { value: 5, label: '5', description: 'Focused' },
  { value: 10, label: '10', description: 'Intense' },
];

export default function SetupProfilePage() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    hasProfile,
    checkUsername,
    createProfile,
  } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [dailyGoal, setDailyGoal] = useState(3);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [isCreating, setIsCreating] = useState(false);
  const debounceTimer = useRef(null);

  // Redirect if already has profile
  useEffect(() => {
    if (isAuthenticated && hasProfile) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, hasProfile, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Validate and debounce username check
  const validateUsername = useCallback(
    (value) => {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Basic validation
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        setUsernameStatus(null);
        return;
      }

      if (trimmed.length < 3) {
        setUsernameStatus('invalid');
        return;
      }

      if (trimmed.length > 20) {
        setUsernameStatus('invalid');
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        setUsernameStatus('invalid');
        return;
      }

      // Debounced availability check
      setUsernameStatus('checking');
      debounceTimer.current = setTimeout(async () => {
        try {
          const isAvailable = await checkUsername(trimmed);
          setUsernameStatus(isAvailable ? 'available' : 'taken');
        } catch {
          setUsernameStatus(null);
          toast.error('Failed to check username availability');
        }
      }, 300);
    },
    [checkUsername]
  );

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameStatus !== 'available') {
      toast.error('Please choose a valid, available username');
      return;
    }

    setIsCreating(true);
    try {
      await createProfile({
        username: username.trim(),
        dailyGoal,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      toast.success('Profile created! Welcome aboard 🚀');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to create profile');
    } finally {
      setIsCreating(false);
    }
  };

  const getValidationMessage = () => {
    switch (usernameStatus) {
      case 'checking':
        return (
          <span className="input-helper" aria-live="polite">
            <Loader2 size={14} className="spinner-inline" />
            Checking availability...
          </span>
        );
      case 'available':
        return (
          <span className="input-helper input-success" aria-live="polite">
            <Check size={14} />
            Username available!
          </span>
        );
      case 'taken':
        return (
          <span className="input-helper input-error" aria-live="polite">
            <X size={14} />
            Username taken
          </span>
        );
      case 'invalid':
        return (
          <span className="input-helper input-error" aria-live="polite">
            <X size={14} />
            3–20 characters, letters, numbers &amp; underscores only
          </span>
        );
      default:
        return (
          <span className="input-helper">
            3–20 characters, letters, numbers &amp; underscores only
          </span>
        );
    }
  };

  // Don't render until we confirm auth state
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-loading" aria-label="Loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb-1 animate-float" aria-hidden="true" />
      <div className="login-bg-orb login-bg-orb-2 animate-float-delayed" aria-hidden="true" />
      <div className="login-bg-orb login-bg-orb-3 animate-float-slow" aria-hidden="true" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        role="main"
        aria-label="Profile setup"
      >
        {/* Avatar */}
        <div className="setup-avatar-wrapper">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Profile avatar'}
              className="avatar avatar-xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="avatar avatar-xl avatar-placeholder">
              <User size={40} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="setup-title">Set up your profile</h1>
        <p className="setup-subtitle">Choose a username to get started</p>

        <form onSubmit={handleSubmit} className="setup-form" noValidate>
          {/* Username Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`input-field ${
                usernameStatus === 'available'
                  ? 'input-success'
                  : usernameStatus === 'taken' || usernameStatus === 'invalid'
                  ? 'input-error'
                  : ''
              }`}
              placeholder="e.g. dsa_warrior"
              value={username}
              onChange={handleUsernameChange}
              maxLength={20}
              autoComplete="off"
              autoFocus
              aria-describedby="username-status"
              aria-invalid={usernameStatus === 'taken' || usernameStatus === 'invalid'}
            />
            <div id="username-status">{getValidationMessage()}</div>
          </div>

          {/* Daily Goal Selector */}
          <div className="input-group">
            <label className="input-label">Daily solving goal</label>
            <div className="goal-selector" role="radiogroup" aria-label="Daily solving goal">
              {DAILY_GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`goal-option ${dailyGoal === option.value ? 'goal-option-active' : ''}`}
                  onClick={() => setDailyGoal(option.value)}
                  role="radio"
                  aria-checked={dailyGoal === option.value}
                  aria-label={`${option.value} questions per day - ${option.description}`}
                >
                  <span className="goal-option-value">{option.label}</span>
                  <span className="goal-option-label">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={usernameStatus !== 'available' || isCreating}
            aria-label="Get Started"
          >
            {isCreating ? (
              <>
                <Loader2 size={18} className="spinner-inline" />
                Creating profile...
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
