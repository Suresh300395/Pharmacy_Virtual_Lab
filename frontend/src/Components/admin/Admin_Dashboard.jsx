import React, { useState, useEffect, useMemo } from 'react'
import Header from '../Common/header/header'
import Footer from '../Common/footer/Footer'
import './Admin_Dashboard.css'

function Admin_Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSectionState] = useState(() => {
    try {
      return localStorage.getItem('vlab_admin_section') || 'overview'
    } catch {
      return 'overview'
    }
  })

  const setActiveSection = (section) => {
    setActiveSectionState(section)
    try {
      localStorage.setItem('vlab_admin_section', section)
    } catch (e) {
      console.error(e)
    }
  }
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'
  const [selectedExpDetails, setSelectedExpDetails] = useState(null)
  const [experiments, setExperiments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [formData, setFormData] = useState({
    experimentId: '',
    title: '',
    info: '',
    equipment: '',
    equipmentImage: '',
    principle: '',
    principleImage: '',
    instructionsText: '',
    isActive: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Validate 1:1 aspect ratio and set image
  const processAndValidateImage = (dataUrlOrUri, field, inputElement = null) => {
    if (!dataUrlOrUri || !dataUrlOrUri.trim()) {
      setFormData(prev => ({ ...prev, [field]: '' }))
      return
    }

    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      const ratio = width / height
      // Check for 1:1 aspect ratio (allowing minor subpixel tolerance between 0.95 and 1.05)
      if (ratio < 0.95 || ratio > 1.05) {
        showStatus(
          'error',
          `Image must have a 1:1 aspect ratio (square). Selected image is ${width}x${height}px.`
        )
        if (inputElement) inputElement.value = ''
        return
      }
      setFormData(prev => ({ ...prev, [field]: dataUrlOrUri }))
    }
    img.onerror = () => {
      showStatus('error', 'Unable to load image for aspect ratio verification.')
      if (inputElement) inputElement.value = ''
    }
    img.src = dataUrlOrUri
  }

  // Convert File to Base64 data URL with 1:1 ratio validation
  const handleImageFileChange = (e, field) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      showStatus('error', 'Image file size should be less than 10MB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      processAndValidateImage(reader.result, field, e.target)
    }
    reader.readAsDataURL(file)
  }

  // Fetch all experiments from DB
  const fetchExperiments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3003/api/experiments')
      const data = await response.json()
      if (response.ok && data.success && Array.isArray(data.experiments)) {
        setExperiments(data.experiments)
      } else {
        showStatus('error', data.message || 'Failed to load experiments.')
      }
    } catch (err) {
      console.error('Error fetching experiments:', err)
      showStatus('error', 'Unable to connect to server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiments()
  }, [])

  const showStatus = (type, text) => {
    setStatusMsg({ type, text })
    setTimeout(() => {
      setStatusMsg({ type: '', text: '' })
    }, 4000)
  }

  // Active experiments count
  const activeExperimentsCount = useMemo(() => {
    return experiments.filter((exp) => exp.isActive !== false).length
  }, [experiments])

  // Filtered experiments
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      const term = searchTerm.toLowerCase()
      const titleMatch = exp.title ? exp.title.toLowerCase().includes(term) : false
      const infoMatch = exp.info ? exp.info.toLowerCase().includes(term) : false
      const equipMatch = exp.equipment ? exp.equipment.toLowerCase().includes(term) : false
      const prinMatch = exp.principle ? exp.principle.toLowerCase().includes(term) : false
      return titleMatch || infoMatch || equipMatch || prinMatch
    })
  }, [experiments, searchTerm])

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingExp(null)
    const nextId = experiments.length > 0 ? Math.max(...experiments.map(e => e.experimentId || 0)) + 1 : 1
    setFormData({
      experimentId: nextId,
      title: '',
      info: '',
      equipment: '',
      equipmentImage: '',
      principle: '',
      principleImage: '',
      instructionsText: '',
      isActive: true,
    })
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEditModal = (exp) => {
    setEditingExp(exp)
    setFormData({
      experimentId: exp.experimentId || '',
      title: exp.title || '',
      info: exp.info || exp.title || '',
      equipment: exp.equipment || '',
      equipmentImage: exp.equipmentImage || '',
      principle: exp.principle || '',
      principleImage: exp.principleImage || '',
      instructionsText: Array.isArray(exp.instructions) ? exp.instructions.join('\n') : exp.instructions || '',
      isActive: exp.isActive !== false,
    })
    setIsModalOpen(true)
  }

  // Toggle Active/Inactive Status in-place without page refresh
  const handleToggleStatus = async (exp, e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const newStatus = exp.isActive === false ? true : false

    // Optimistically update state in-place for instant UI feedback
    setExperiments(prevExps =>
      prevExps.map(item =>
        (item._id && exp._id && item._id === exp._id) || (item.experimentId === exp.experimentId)
          ? { ...item, isActive: newStatus }
          : item
      )
    )

    try {
      const response = await fetch(`http://localhost:3003/api/experiments/${exp._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        showStatus('success', `Experiment #${exp.experimentId || ''} status updated to ${newStatus ? 'Active' : 'Inactive'}.`)
      } else {
        // Rollback state on failure
        setExperiments(prevExps =>
          prevExps.map(item =>
            (item._id && exp._id && item._id === exp._id) || (item.experimentId === exp.experimentId)
              ? { ...item, isActive: exp.isActive }
              : item
          )
        )
        showStatus('error', data.message || 'Failed to update status.')
      }
    } catch (err) {
      console.error('Error toggling status:', err)
      // Rollback state on network error
      setExperiments(prevExps =>
        prevExps.map(item =>
          (item._id && exp._id && item._id === exp._id) || (item.experimentId === exp.experimentId)
            ? { ...item, isActive: exp.isActive }
            : item
        )
      )
      showStatus('error', 'Network error updating experiment status.')
    }
  }

  // Save form handler (Create / Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      showStatus('error', 'Experiment title is required.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        experimentId: Number(formData.experimentId),
        title: formData.title,
        info: formData.info,
        equipment: formData.equipment,
        equipmentImage: formData.equipmentImage,
        principle: formData.principle,
        principleImage: formData.principleImage,
        instructions: formData.instructionsText.split('\n').map(s => s.trim()).filter(Boolean),
        isActive: formData.isActive,
      }

      const url = editingExp
        ? `http://localhost:3003/api/experiments/${editingExp._id}`
        : 'http://localhost:3003/api/experiments'

      const method = editingExp ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showStatus('success', editingExp ? 'Experiment updated successfully!' : 'Experiment created successfully!')
        setIsModalOpen(false)
        fetchExperiments()
      } else {
        showStatus('error', data.message || 'Operation failed.')
      }
    } catch (err) {
      console.error('Error saving experiment:', err)
      showStatus('error', 'Network error saving experiment.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete experiment handler
  const handleDeleteExperiment = async (exp) => {
    if (!window.confirm(`Are you sure you want to delete "${exp.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3003/api/experiments/${exp._id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showStatus('success', 'Experiment deleted successfully.')
        fetchExperiments()
      } else {
        showStatus('error', data.message || 'Failed to delete experiment.')
      }
    } catch (err) {
      console.error('Error deleting experiment:', err)
      showStatus('error', 'Network error deleting experiment.')
    }
  }

  return (
    <div className="admin-page">
      <Header title="Admin Dashboard" user={user} onLogout={onLogout} />

      <main className="admin-main-container">
        {/* Toast Status Notification */}
        {statusMsg.text && (
          <div className={`admin-toast ${statusMsg.type}`}>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {activeSection === 'overview' ? (
          /* =========================================================
             VIEW 1: ADMIN DASHBOARD MAIN OVERVIEW GRID
             ========================================================= */
          <div className="admin-overview-section">
            <div className="overview-hero-card">
              <div className="hero-text">
                <h2>Welcome to Admin Dashboard</h2>
                <p>Manage pharmacology virtual experiments, equipment details, scientific principles, and instructions.</p>
              </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="admin-cards-grid">
              {/* Card 1: Experiments Management */}
              <div
                className="admin-module-card clickable-card"
                onClick={() => setActiveSection('experiments')}
              >
                <div className="card-icon-wrap blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 2v7.31L4.75 20.5a2 2 0 0 0 1.71 3h11.08a2 2 0 0 0 1.71-3L14 9.31V2" />
                    <line x1="8.5" y1="2" x2="15.5" y2="2" />
                    <line x1="14" y1="9.31" x2="10" y2="9.31" />
                  </svg>
                </div>
                <div className="card-badge">{activeExperimentsCount} Active / {experiments.length} Total</div>
                <h3 className="card-title">Pharmacology Experiments</h3>
                <p className="card-desc">
                  Create, edit, and manage titles, equipment details, scientific principles, and step-by-step lab instructions.
                </p>
                <div className="card-action-link">
                  <span>Manage Experiments</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Card 2: User Accounts */}
              <div className="admin-module-card">
                <div className="card-icon-wrap green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="card-badge">System Users</div>
                <h3 className="card-title">User Accounts</h3>
                <p className="card-desc">
                  View registered student accounts, faculty members, and system administrator access credentials.
                </p>
                <div className="card-action-link disabled">
                  <span>System Active</span>
                </div>
              </div>

              {/* Card 3: Lab Analytics */}
              <div className="admin-module-card">
                <div className="card-icon-wrap purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="card-badge">Analytics</div>
                <h3 className="card-title">Lab Activity & Reports</h3>
                <p className="card-desc">
                  Monitor student simulation progress, lab completion rates, and virtual apparatus performance logs.
                </p>
                <div className="card-action-link disabled">
                  <span>System Active</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             VIEW 2: EXPERIMENTS MANAGEMENT VIEW (CARDS & TABLE)
             ========================================================= */
          <div className="admin-experiments-section">
            {/* Top Navigation Bar */}
            <div className="admin-top-nav">
              <button
                className="back-overview-btn"
                onClick={() => setActiveSection('overview')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Back to Admin Dashboard</span>
              </button>
            </div>

            {/* Dashboard Header Banner */}
            <div className="admin-banner-card">
              <div className="banner-text">
                <h2>Pharmacology Experiments Management</h2>
                <p>Click on any experiment card below to view details, equipment, principles, and instructions.</p>
              </div>
              <div className="banner-actions">
                <div className="stat-pill">
                  <span className="pill-number">{experiments.length}</span>
                  <span className="pill-text">Total Experiments</span>
                </div>
                <div className="stat-pill active-pill">
                  <span className="pill-number">{activeExperimentsCount}</span>
                  <span className="pill-text">Active Experiments</span>
                </div>
                <button className="create-exp-btn" onClick={handleOpenCreateModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add New Experiment</span>
                </button>
              </div>
            </div>

            {/* Search Bar & View Mode Switcher */}
            <div className="admin-controls-bar">
              <div className="search-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search experiments by title, equipment, or principle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
                {searchTerm && (
                  <button className="clear-btn" onClick={() => setSearchTerm('')}>
                    ×
                  </button>
                )}
              </div>

              {/* View Switcher: Cards vs Table */}
              <div className="view-mode-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Card View"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Cards</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* CONTENT AREA: CARDS GRID (DEFAULT) OR TABLE VIEW */}
            {viewMode === 'cards' ? (
              /* ====================================
                 CARDS GRID VIEW (CLICK CARD TO OPEN)
                 ==================================== */
              isLoading ? (
                <div className="loading-container">
                  <p>Loading experiments from database...</p>
                </div>
              ) : filteredExperiments.length > 0 ? (
                <div className="experiment-cards-grid">
                  {filteredExperiments.map((exp, idx) => (
                    <div
                      key={exp._id || idx}
                      className="exp-item-card"
                      onClick={() => setSelectedExpDetails(exp)}
                    >
                      <div className="exp-card-top flex-between">
                        <span className="exp-id-tag">#{exp.experimentId || idx + 1}</span>
                        <div className="exp-badges-right">
                          <span
                            className={`status-pill ${exp.isActive !== false ? 'active' : 'inactive'}`}
                            onClick={(e) => handleToggleStatus(exp, e)}
                            title="Click to toggle status"
                          >
                            {exp.isActive !== false ? '● Active' : '○ Inactive'}
                          </span>
                          <span className="exp-steps-badge">
                            {Array.isArray(exp.instructions) ? `${exp.instructions.length} Steps` : '4 Steps'}
                          </span>
                        </div>
                      </div>

                      <h3 className="exp-card-heading">{exp.title}</h3>

                      {exp.equipment && (
                        <div className="exp-snippet-box">
                          <span className="snippet-label">Equipment:</span>
                          <p>{exp.equipment}</p>
                        </div>
                      )}

                      {exp.principle && (
                        <div className="exp-snippet-box">
                          <span className="snippet-label">Principle:</span>
                          <p>{exp.principle}</p>
                        </div>
                      )}

                      <div className="exp-card-footer" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="card-btn open-details"
                          onClick={() => setSelectedExpDetails(exp)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Open Details</span>
                        </button>

                        <div className="card-footer-right">
                          <button
                            className={`card-btn status-toggle ${exp.isActive !== false ? 'active' : 'inactive'}`}
                            onClick={(e) => handleToggleStatus(exp, e)}
                            title={exp.isActive !== false ? 'Click to deactivate (hide from students)' : 'Click to activate (show to students)'}
                          >
                            {exp.isActive !== false ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            className="card-btn edit"
                            onClick={() => handleOpenEditModal(exp)}
                            title="Edit Experiment"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="card-btn delete"
                            onClick={() => handleDeleteExperiment(exp)}
                            title="Delete Experiment"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-experiments-box">
                  <p>No experiments found matching "{searchTerm}".</p>
                </div>
              )
            ) : (
              /* ====================================
                 TABLE VIEW
                 ==================================== */
              <div className="admin-table-card">
                <div className="table-responsive">
                  <table className="admin-exp-table">
                    <thead>
                      <tr>
                        <th className="th-id">#</th>
                        <th className="th-title">Experiment Title</th>
                        <th className="th-status">Status</th>
                        <th className="th-equipment">Equipment</th>
                        <th className="th-principle">Scientific Principle</th>
                        <th className="th-instructions">Instructions</th>
                        <th className="th-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="table-empty-cell">
                            Loading experiments from database...
                          </td>
                        </tr>
                      ) : filteredExperiments.length > 0 ? (
                        filteredExperiments.map((exp, idx) => (
                          <tr key={exp._id || idx} className="admin-table-row">
                            <td className="td-id">{exp.experimentId || idx + 1}</td>
                            <td className="td-title">
                              <div
                                className="exp-title-bold clickable-title"
                                onClick={() => setSelectedExpDetails(exp)}
                              >
                                {exp.title}
                              </div>
                            </td>
                            <td className="td-status">
                              <button
                                className={`table-status-badge ${exp.isActive !== false ? 'active' : 'inactive'}`}
                                onClick={(e) => handleToggleStatus(exp, e)}
                                title="Click to toggle active/inactive status"
                              >
                                {exp.isActive !== false ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="td-equipment">
                              <div className="cell-snippet" title={exp.equipment}>
                                {exp.equipment ? exp.equipment : <span className="muted-text">No equipment specified</span>}
                              </div>
                            </td>
                            <td className="td-principle">
                              <div className="cell-snippet" title={exp.principle}>
                                {exp.principle ? exp.principle : <span className="muted-text">No principle specified</span>}
                              </div>
                            </td>
                            <td className="td-instructions">
                              <div className="instructions-count">
                                {Array.isArray(exp.instructions) ? `${exp.instructions.length} steps` : 'Default steps'}
                              </div>
                            </td>
                            <td className="td-actions">
                              <div className="action-buttons-group">
                                <button
                                  className="btn-action edit"
                                  onClick={() => handleOpenEditModal(exp)}
                                  title="Edit Experiment"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="btn-action delete"
                                  onClick={() => handleDeleteExperiment(exp)}
                                  title="Delete Experiment"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="table-empty-cell">
                            No experiments found matching "{searchTerm}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal for Experiment Detailed View (When clicking Card) */}
        {selectedExpDetails && (
          <div className="modal-overlay" onClick={() => setSelectedExpDetails(null)}>
            <div className="modal-card detail-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="detail-modal-title-group">
                  <span className="exp-id-pill">#{selectedExpDetails.experimentId}</span>
                  <h3>{selectedExpDetails.title}</h3>
                </div>
                <button className="close-modal-btn" onClick={() => setSelectedExpDetails(null)}>
                  ×
                </button>
              </div>

              <div className="detail-modal-body">
                {selectedExpDetails.info && (
                  <div className="detail-info-block">
                    <h4>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                      </svg>
                      Experiment Banner Info (info)
                    </h4>
                    <p><strong>{selectedExpDetails.info}</strong></p>
                  </div>
                )}

                <div className="detail-info-block">
                  <h4>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    Equipment Required
                  </h4>
                  <p>{selectedExpDetails.equipment || 'No equipment details specified.'}</p>
                  {selectedExpDetails.equipmentImage && (
                    <div className="detail-img-wrapper">
                      <img src={selectedExpDetails.equipmentImage} alt="Equipment Diagram" className="detail-display-img" />
                    </div>
                  )}
                </div>

                <div className="detail-info-block">
                  <h4>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Scientific Principle
                  </h4>
                  <p>{selectedExpDetails.principle || 'No scientific principle specified.'}</p>
                  {selectedExpDetails.principleImage && (
                    <div className="detail-img-wrapper">
                      <img src={selectedExpDetails.principleImage} alt="Scientific Principle Diagram" className="detail-display-img" />
                    </div>
                  )}
                </div>

                <div className="detail-info-block">
                  <h4>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Step-by-Step Instructions
                  </h4>
                  {Array.isArray(selectedExpDetails.instructions) && selectedExpDetails.instructions.length > 0 ? (
                    <ol className="modal-steps-list">
                      {selectedExpDetails.instructions.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="muted-text">No step-by-step instructions specified.</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-action edit"
                  onClick={() => {
                    handleOpenEditModal(selectedExpDetails);
                    setSelectedExpDetails(null);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Experiment</span>
                </button>
                <button
                  type="button"
                  className="btn-action delete"
                  onClick={() => {
                    const expToDelete = selectedExpDetails;
                    setSelectedExpDetails(null);
                    handleDeleteExperiment(expToDelete);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Delete Experiment</span>
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setSelectedExpDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Create & Edit */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingExp ? 'Edit Experiment' : 'Add New Experiment'}</h3>
                <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="modal-form">
                <div className="form-group-row">
                  <div className="form-group col-id">
                    <label>Experiment #ID</label>
                    <input
                      type="number"
                      value={formData.experimentId}
                      onChange={(e) => setFormData({ ...formData, experimentId: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-status-select">
                    <label>Status (Active / Inactive)</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="form-select-status"
                    >
                      <option value="active">Active (Visible to Students)</option>
                      <option value="inactive">Inactive (Hidden from Students)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Experiment Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Study of muscle relaxant activity..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Experiment Banner Info / Heading (info)</label>
                  <input
                    type="text"
                    placeholder="e.g. EFFECT OF CNS SUPPRESSANT AND SKELATEL MUSCLE RELAXANT DRUG..."
                    value={formData.info}
                    onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  />
                </div>

                {/* Equipment Section with Image Upload */}
                <div className="form-group">
                  <label>Equipment Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe apparatus, setup, compartments, sensors..."
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  ></textarea>

                  <div className="image-field-block">
                    <span className="field-sub-label">Equipment Image</span>
                    <div className="upload-input-row">
                      <label className="upload-btn-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e, 'equipmentImage')}
                          hidden
                        />
                      </label>
                      <span className="or-text">or</span>
                      <input
                        type="text"
                        placeholder="Paste image URL here..."
                        value={formData.equipmentImage}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData(prev => ({ ...prev, equipmentImage: val }))
                        }}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            processAndValidateImage(e.target.value.trim(), 'equipmentImage', e.target)
                          }
                        }}
                        className="url-file-input"
                      />
                    </div>

                    {formData.equipmentImage && (
                      <div className="img-preview-card">
                        <img src={formData.equipmentImage} alt="Equipment Preview" className="preview-img" />
                        <button
                          type="button"
                          className="remove-img-btn"
                          onClick={() => setFormData({ ...formData, equipmentImage: '' })}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scientific Principle Section with Image Upload */}
                <div className="form-group">
                  <label>Scientific Principle</label>
                  <textarea
                    rows="3"
                    placeholder="Describe physiological mechanism, drug action, observations..."
                    value={formData.principle}
                    onChange={(e) => setFormData({ ...formData, principle: e.target.value })}
                  ></textarea>

                  <div className="image-field-block">
                    <span className="field-sub-label">Scientific Principle Image</span>
                    <div className="upload-input-row">
                      <label className="upload-btn-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e, 'principleImage')}
                          hidden
                        />
                      </label>
                      <span className="or-text">or</span>
                      <input
                        type="text"
                        placeholder="Paste image URL here..."
                        value={formData.principleImage}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData(prev => ({ ...prev, principleImage: val }))
                        }}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            processAndValidateImage(e.target.value.trim(), 'principleImage', e.target)
                          }
                        }}
                        className="url-file-input"
                      />
                    </div>

                    {formData.principleImage && (
                      <div className="img-preview-card">
                        <img src={formData.principleImage} alt="Principle Preview" className="preview-img" />
                        <button
                          type="button"
                          className="remove-img-btn"
                          onClick={() => setFormData({ ...formData, principleImage: '' })}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Step-by-Step Instructions (Enter one step per line)</label>
                  <textarea
                    rows="4"
                    placeholder="Step 1: Review theoretical principle...&#10;Step 2: Launch interactive apparatus...&#10;Step 3: Administer doses..."
                    value={formData.instructionsText}
                    onChange={(e) => setFormData({ ...formData, instructionsText: e.target.value })}
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingExp ? 'Update Experiment' : 'Create Experiment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer showBadges={false} />
    </div>
  )
}

export default Admin_Dashboard
