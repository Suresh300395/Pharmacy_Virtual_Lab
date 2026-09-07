import React from 'react'
import './Button.css'

/**
 * Reusable Stadium Animated Button Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label text or inner elements
 * @param {string} [props.type='button'] - HTML button type ('button' | 'submit' | 'reset')
 * @param {function} [props.onClick] - Click event handler
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className=''] - Additional custom CSS class names
 */
function Button({ children, type = 'button', onClick, disabled = false, variant = 'default', className = '' }) {
  const variantClass = (variant === 'orange' || variant === 'orange-gradient') ? 'btn-orange-gradient' : ''
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-stadium ${variantClass} ${className}`.trim()}
    >
      <span className="btn-content-inner">{children}</span>
    </button>
  )
}

export default Button
