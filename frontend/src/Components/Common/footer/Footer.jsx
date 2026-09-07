import React from 'react'
import './Footer.css'

function Footer({ showBadges = true }) {
  return (
    <footer className="main-footer">
      {showBadges && (
        <div className="feature-badges-bar">
          <div className="badge-item">
            <div className="badge-icon-circle indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="badge-text">
              <div className="badge-title">Learn & Explore</div>
              <div className="badge-desc">Enhance your knowledge</div>
            </div>
          </div>

          <div className="badge-item">
            <div className="badge-icon-circle blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="badge-text">
              <div className="badge-title">Safe & Secure</div>
              <div className="badge-desc">Your data is protected</div>
            </div>
          </div>
        </div>
      )}

      <div className="copyright-text">
        Designed & Developed by IT Application
      </div>
    </footer>
  )
}

export default Footer
