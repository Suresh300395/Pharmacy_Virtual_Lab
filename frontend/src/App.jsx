import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import Login from './Components/authentication/login.jsx'
import Student_Experiments from './Components/student/Experiment_main_pages/Student_Experiments_Dashboard.jsx'
import Admin_Dashboard from './Components/admin/Admin_Dashboard.jsx'
import WelcomePage from './Components/student/Experiment_main_pages/welcome_page.jsx'
import ExperimentMainPage from './Components/student/Experiment_main_pages/Experiment_main_page.jsx'

function DynamicSlugWrapper({ user, onLogout, getDefaultRoute }) {
  const { slug } = useParams()

  if (!slug || !slug.startsWith('experiment_')) {
    return <Navigate to={getDefaultRoute()} replace />
  }

  const isRunPage = slug.endsWith('_run')
  const cleanId = slug.replace(/^experiment_/, '').replace(/_run$/, '')

  if (isRunPage) {
    return <ExperimentMainPage expId={cleanId} user={user} onLogout={onLogout} />
  }

  return <WelcomePage expId={cleanId} user={user} onLogout={onLogout} />
}

function LegacySlashWrapper({ user, onLogout, isRun = false }) {
  const { id } = useParams()
  if (isRun) {
    return <ExperimentMainPage expId={id} user={user} onLogout={onLogout} />
  }
  return <WelcomePage expId={id} user={user} onLogout={onLogout} />
}

function App() {
  const navigate = useNavigate()
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
    if (userData?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/student')
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
    navigate('/login')
  }

  const getDefaultRoute = () => {
    if (!isLoggedIn) return '/login'
    return user?.role === 'admin' ? '/admin' : '/student'
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route
        path="/admin"
        element={
          isLoggedIn && user?.role === 'admin' ? (
            <Admin_Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to={getDefaultRoute()} replace />
          )
        }
      />

      <Route
        path="/student"
        element={
          isLoggedIn ? (
            <Student_Experiments user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Slash format matching: /experiment/:id and /experiment/:id/run */}
      <Route
        path="/experiment/:id/run"
        element={
          isLoggedIn ? (
            <LegacySlashWrapper user={user} onLogout={handleLogout} isRun={true} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/experiment/:id"
        element={
          isLoggedIn ? (
            <LegacySlashWrapper user={user} onLogout={handleLogout} isRun={false} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Underscore format matching: /experiment_1, /experiment_1_run */}
      <Route
        path="/:slug"
        element={
          isLoggedIn ? (
            <DynamicSlugWrapper user={user} onLogout={handleLogout} getDefaultRoute={getDefaultRoute} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default Catch-all Redirect */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  )
}

export default App

