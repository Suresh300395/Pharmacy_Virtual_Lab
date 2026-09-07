import { useState } from 'react'
import Footer from '../../Components/Common/footer/Footer'
import ThemeToggle from '../../Components/Common/theme/ThemeToggle'
import { useTheme } from '../../context/ThemeContext'

function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const { isDarkMode: isDarkTheme } = useTheme()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatusMessage('')
    setStatusType('')

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setStatusType('error')
        setStatusMessage('Passwords do not match.')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('http://localhost:3003/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fullName, email, mobile, password }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          if (onLoginSuccess) {
            onLoginSuccess(data.user)
          }
        } else {
          setStatusType('error')
          setStatusMessage(data.message || 'Registration failed.')
        }
      } catch (err) {
        console.error('Registration error:', err)
        setStatusType('error')
        setStatusMessage('Unable to connect to server. Please try again.')
      } finally {
        setIsLoading(false)
      }
    } else if (authMode === 'forgot') {
      try {
        const response = await fetch('http://localhost:3003/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setStatusType('success')
          setStatusMessage(data.message || `OTP sent successfully to ${email}.`)
        } else {
          setStatusType('error')
          setStatusMessage(data.message || 'Failed to send OTP.')
        }
      } catch (err) {
        console.error('Forgot password error:', err)
        setStatusType('error')
        setStatusMessage('Unable to connect to server. Please try again.')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Sign In mode
      try {
        const response = await fetch('http://localhost:3003/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          if (onLoginSuccess) {
            onLoginSuccess(data.user)
          }
        } else {
          setStatusType('error')
          setStatusMessage(data.message || 'Invalid email or password.')
        }
      } catch (err) {
        console.error('Login error:', err)
        setStatusType('error')
        setStatusMessage('Unable to connect to server. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const changeMode = (mode) => {
    setAuthMode(mode)
    setStatusMessage('')
    setStatusType('')
  }

  return (
    <div className="login-wrapper">
      {/* Background Decorative Elements */}
      <div className="bg-top-curve"></div>
      <div className="bg-left-glow"></div>
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>

      {/* Floating Shield Badge on Far Left */}
      <div className="far-left-shield">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      <div className="main-layout">
        {/* Left Glassmorphic Card */}
        <div className="glass-card">
          {/* Vertical Theme Toggle Button on Card Right Edge */}
          <div className="card-theme-toggle-wrapper">
            <ThemeToggle />
          </div>

          <div className="card-header">
            <h1>
              {authMode === 'signup'
                ? 'Create Account'
                : authMode === 'forgot'
                  ? 'Forgot Password'
                  : 'Login'}
            </h1>
            <p className="subtitle">
              {authMode === 'signup'
                ? 'Fill in your details to create your virtual lab account.'
                : authMode === 'forgot'
                  ? 'Enter your registered email address to receive reset instructions.'
                  : 'Welcome back! Please enter your credentials to access your portal.'}
            </p>
          </div>

          {statusMessage && (
            <div className={`status-alert ${statusType}`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {authMode === 'signup' ? (
              <>
                {/* Sign Up Fields */}
                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="fullName" className="floating-label">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="email" className="floating-label">Email ID</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email ID"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="mobile" className="floating-label">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile Number"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="password" className="floating-label">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="confirmPassword" className="floating-label">Confirm Password</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : authMode === 'forgot' ? (
              <>
                {/* Forgot Password Fields */}
                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="email" className="floating-label">Email ID</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email ID"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Sign In Fields */}
                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="email" className="floating-label">Email ID</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email ID"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-field-wrapper">
                    <label htmlFor="password" className="floating-label">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <a
                    href="#forgot"
                    className="forgot-link"
                    onClick={(e) => {
                      e.preventDefault()
                      changeMode('forgot')
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              <span>
                {isLoading
                  ? authMode === 'signup'
                    ? 'Creating Account...'
                    : authMode === 'forgot'
                      ? 'Sending OTP...'
                      : 'Signing In...'
                  : authMode === 'signup'
                    ? 'Create Account'
                    : authMode === 'forgot'
                      ? 'Send OTP'
                      : 'Sign In'}
              </span>
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="card-footer">
            {authMode === 'signup' ? (
              <>
                Already have an account?{' '}
                <a
                  href="#signin"
                  className="register-link"
                  onClick={(e) => {
                    e.preventDefault()
                    changeMode('signin')
                  }}
                >
                  Sign In
                </a>
              </>
            ) : authMode === 'forgot' ? (
              <>
                Remembered your password?{' '}
                <a
                  href="#signin"
                  className="register-link"
                  onClick={(e) => {
                    e.preventDefault()
                    changeMode('signin')
                  }}
                >
                  Sign In
                </a>
              </>
            ) : (
              <>
                New here?{' '}
                <a
                  href="#create"
                  className="register-link"
                  onClick={(e) => {
                    e.preventDefault()
                    changeMode('signup')
                  }}
                >
                  Create an account
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Section with Illustration & Footer */}
        <div className="right-section">
          <div className="hero-image-wrapper">
            <img
              src={isDarkTheme ? "/Login_dark.webp" : "/Login_light.webp"}
              alt="Pharmacy Virtual Lab"
              className="hero-image"
            />
          </div>

          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Login
