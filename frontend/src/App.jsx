import { useState } from 'react'
import Login from './Components/authentication/login.jsx'
import Student_Experiments from './Components/student/Student_Experiments_Dashboard.jsx'
import Admin_Dashboard from './Components/admin/Admin_Dashboard.jsx'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vlab_user')
      return !!savedUser
    } catch {
      return false
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vlab_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    try {
      localStorage.setItem('vlab_user', JSON.stringify(userData))
    } catch (e) {
      console.error('Failed to save user state:', e)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    try {
      localStorage.removeItem('vlab_user')
      localStorage.removeItem('vlab_selected_experiment')
      localStorage.removeItem('vlab_show_main_experiment')
      localStorage.removeItem('vlab_admin_section')
    } catch (e) {
      console.error('Failed to clear user state:', e)
    }
  }

  if (isLoggedIn) {
    if (user?.role === 'admin') {
      return <Admin_Dashboard user={user} onLogout={handleLogout} />
    }
    return <Student_Experiments user={user} onLogout={handleLogout} />
  }

  return <Login onLoginSuccess={handleLoginSuccess} />
}

export default App

