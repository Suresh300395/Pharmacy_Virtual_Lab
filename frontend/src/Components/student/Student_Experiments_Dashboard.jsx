import React, { useState, useEffect, useMemo } from 'react'
import Header from '../Common/header/header'
import Footer from '../Common/footer/Footer'
import Button from '../Common/button/Button'
import WelcomePage from './Experiments/welcome_page'
import './Student_Experiments_dashboard.css'

const FALLBACK_EXPERIMENTS = [
  { id: 1, experimentId: 1, title: 'Study of muscle relaxant activity with the help of "rota rod apparatus".' },
  { id: 2, experimentId: 2, title: 'Study of cns depressents & stimulants using "actophotometer".' },
  { id: 3, experimentId: 3, title: 'Study of analgesic activity with the help of "tail flick apparatus".' },
  { id: 4, experimentId: 4, title: 'Study of antihistaminic drugs with the help of histamine chamber (mast cell stabilization method).' },
  { id: 5, experimentId: 5, title: 'Study of analgesic activity with the help of "hot plate apparatus".' },
  { id: 6, experimentId: 6, title: 'Study of drugs acting on cns using "elevated plus maze".' },
  { id: 7, experimentId: 7, title: 'Study of anticonvulsant activity using "electro covulsiometer".' },
  { id: 8, experimentId: 8, title: "Experiment on effects of various drugs on rabbit's eye." },
  { id: 9, experimentId: 9, title: 'To study analgesic activity by writhing test.' },
  { id: 10, experimentId: 10, title: 'To study PTZ induced convulsions in mice.' },
  { id: 11, experimentId: 11, title: "Effect of different drugs on frog's heart." },
  { id: 12, experimentId: 12, title: '2 Modules - 1. Recording of DRC and bioassay of histamine on the ileum of guinea pig by matching method.\n2. Effect of agonist & antagonist on guinea pig ileum.' },
  { id: 13, experimentId: 13, title: 'Experiments of rat blood sugar.' },
  { id: 14, experimentId: 14, title: '3 Modules - To record the dose response curve and to determine the pD2 value for acetylcholine (on frog rectus abdominis muscle), serotonin (on rat fundus strip) and histamine (on guinea pig ileum).' },
  { id: 15, experimentId: 15, title: '4 Modules - Bioassay of acetylcholine (on frog rectus abdominis muscle), oxytocin (on rat uterine horn) and serotonin (on rat fundus strip), Bioassay of acetylcholine (on rat ileum/colon) - by matching, interpolation, 3 point and 4 point method.' },
  { id: 16, experimentId: 16, title: 'Study of diuretic activity using metabolic cage.' },
  { id: 17, experimentId: 17, title: 'Study of anti-inflammatory activity using carrageenan induced paw oedema method.' },
  { id: 18, experimentId: 18, title: 'Rabbit pyrogen test.' },
  { id: 19, experimentId: 19, title: '4 Modules - Effects of drugs on the dog BP and heart rate.' },
  { id: 20, experimentId: 20, title: 'Effects of drugs on the ciliary motility of frog oesophagus (gastro intestinal tract).' },
  { id: 21, experimentId: 21, title: 'Study of anti ulcer activity - using pylorus ligation method.' },
  { id: 22, experimentId: 22, title: 'Study of stereotype and anti-catatonic activity of drugs on mice.' },
  { id: 23, experimentId: 23, title: 'Evaluation of effect of acetylcholine (spasmogens) using rabbit jejunum.' },
  { id: 24, experimentId: 24, title: "Evaluation of anti psychotic drugs using cook's pole climbing apparatus." },
  { id: 25, experimentId: 25, title: "Evaluation of sedative drugs using cook's pole climbing apparatus." },
  { id: 26, experimentId: 26, title: 'Acute skin irritation test (draize test).' },
  { id: 27, experimentId: 27, title: 'Acute eye irritation test (draize test).' },
  { id: 28, experimentId: 28, title: 'Effect of saline purgatives on frog intestine.' },
  { id: 29, experimentId: 29, title: '4 Modules - Amphibian nerve muscle experiments.' },
  { id: 30, experimentId: 30, title: 'Study of effect of hepatic microsomal enzyme inducer on the phenobarbitone sleeping time in mice.' },
  { id: 31, experimentId: 31, title: 'Determination of pA2 value of prazosin using rat anococcygeus muscle (by schilds plot method).' },
  { id: 32, experimentId: 32, title: 'To estimate LD50 using hypothetical data through computer-simulated experimentation (as per OECD 425 guideline) using software.' },
  { id: 33, experimentId: 33, title: 'To record DRC of acetylcholine and to study the potentiating effect of physostigmine on acetylcholine and also to study the antagonizing effect of d-tubocurarine on acetylcholine.' },
  { id: 34, experimentId: 34, title: 'Evaluation of analgesic activity of centrally acting analgesics using tail immersion method.' },
  { id: 35, experimentId: 35, title: 'Evaluation of antidepressant activity of drugs using the tail suspension test.' },
  { id: 36, experimentId: 36, title: 'To study the antiallergic effects of drugs using mast cell degranulation assay.' },
  { id: 37, experimentId: 37, title: "To demonstrate Langendorff's heart assembly and its applications in pharmacology." },
]

function Student_Experiments({ user, onLogout }) {
  const [experiments, setExperiments] = useState([])
  const [selectedExperiment, setSelectedExperimentState] = useState(() => {
    try {
      const savedExp = localStorage.getItem('vlab_selected_experiment')
      return savedExp ? JSON.parse(savedExp) : null
    } catch {
      return null
    }
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const handleSelectExperiment = (exp) => {
    setSelectedExperimentState(exp)
    try {
      if (exp) {
        localStorage.setItem('vlab_selected_experiment', JSON.stringify(exp))
      } else {
        localStorage.removeItem('vlab_selected_experiment')
        localStorage.removeItem('vlab_show_main_experiment')
      }
    } catch (e) {
      console.error('Failed to update vlab_selected_experiment in localStorage:', e)
    }
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

  // Filtered experiments by search term
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) =>
      exp.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [experiments, searchTerm])

  if (selectedExperiment) {
    return (
      <WelcomePage
        experiment={selectedExperiment}
        onBack={() => handleSelectExperiment(null)}
        user={user}
        onLogout={onLogout}
      />
    )
  }

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
            <div className="stat-card">
              <span className="stat-value">{isLoading ? '...' : experiments.length}</span>
              <span className="stat-label">Total Experiments</span>
            </div>
            <div className="stat-card active">
              <span className="stat-value">{isLoading ? '...' : filteredExperiments.length}</span>
              <span className="stat-label">Available</span>
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
