import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../Common/header/header'
import Footer from '../../Common/footer/Footer'
import Button from '../../Common/button/Button'
import { FALLBACK_EXPERIMENTS } from '../../../utils/experimentUtils'
import './Student_Experiments_dashboard.css'

function Student_Experiments({ user, onLogout }) {
  const navigate = useNavigate()
  const [experiments, setExperiments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const handleSelectExperiment = (exp) => {
    const expId = exp.experimentId || exp.id || 1
    navigate(`/experiment_${expId}`)
  }

  // Fetch experiments dynamically from MongoDB Atlas backend API
  useEffect(() => {
    const fetchExperiments = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:3003/api/experiments')
        const data = await response.json()
        if (response.ok && data.success && Array.isArray(data.experiments) && data.experiments.length > 0) {
          setExperiments(data.experiments)
        } else {
          setExperiments(FALLBACK_EXPERIMENTS)
        }
      } catch (err) {
        console.error('Error fetching experiments from backend, using fallback data:', err)
        setExperiments(FALLBACK_EXPERIMENTS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiments()
  }, [])

  // Active experiments count for students
  const activeExperimentsCount = useMemo(() => {
    return experiments.filter((exp) => exp.isActive !== false).length
  }, [experiments])

  // Filter active experiments only by search term for students
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      const isExpActive = exp.isActive !== false
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase())
      return isExpActive && matchesSearch
    })
  }, [experiments, searchTerm])

  return (
    <div className="experiments-page">
      <Header title="Student Experiments" user={user} onLogout={onLogout} />

      <main className="experiments-main-container">
        {/* Page Banner / Header section */}
        <div className="dashboard-banner">
          <div className="banner-info">
            <h2>Pharmacology Virtual Experiments</h2>
            <p>Select an experiment below to start interactive virtual simulation and data analysis.</p>
          </div>
          <div className="stats-pills">
            <div className="stat-card active">
              <span className="stat-value">{isLoading ? '...' : activeExperimentsCount}</span>
              <span className="stat-label">Available Experiments</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="table-controls-bar">
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search experiment by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="table-search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Experiments Table Card */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="experiments-table">
              <thead>
                <tr>
                  <th className="col-id">#</th>
                  <th className="col-title">Experiment Title</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="no-results-cell">
                      <div className="no-results-content">
                        <p>Loading experiments from database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredExperiments.length > 0 ? (
                  filteredExperiments.map((exp, index) => (
                    <tr key={exp._id || exp.id || index} className="table-row">
                      <td className="col-id-cell">{exp.experimentId || index + 1}</td>
                      <td className="col-title-cell">
                        <div className="exp-title-text">{exp.title}</div>
                      </td>
                      <td className="col-action-cell">
                        <Button
                          className="start-lab-btn"
                          onClick={() => handleSelectExperiment(exp)}
                        >
                          Start Lab
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-results-cell">
                      <div className="no-results-content">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <p>No experiments found matching "{searchTerm}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer showBadges={false} />
    </div>
  )
}

export default Student_Experiments
