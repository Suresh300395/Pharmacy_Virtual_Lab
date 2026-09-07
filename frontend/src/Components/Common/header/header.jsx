import React, { useState, useEffect, useRef } from 'react'
import ThemeToggle from '../theme/ThemeToggle'
import './header.css'

function Header({ title = 'Student Experiments', user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const displayName = user?.fullName || user?.email || 'User'
  const firstLetter = displayName.charAt(0).toUpperCase()
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="main-app-header">
      <div className="header-left-brand">
        <img src="/acc.svg" alt="Aditya University Logo" className="header-logo" />
      </div>

      <div className="header-right-actions">
        {/* Theme Toggle Component from theme folder */}
        <ThemeToggle />

        {/* User Profile Dropdown Container */}
        <div className="header-user-container" ref={dropdownRef}>
          <button
            className="profile-trigger-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-label="User menu"
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={displayName} className="user-avatar-img" />
            ) : (
              <div className="user-avatar-initial">
                {firstLetter}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-name">{displayName}</div>
                  {user?.email && user?.fullName && (
                    <div className="dropdown-email">{user.email}</div>
                  )}
                  <span className={`role-badge ${userRole.toLowerCase()}`}>{userRole}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    onLogout()
                  }}
                  className="dropdown-logout-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
