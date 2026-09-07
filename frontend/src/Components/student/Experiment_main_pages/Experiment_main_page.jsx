import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Header from '../../Common/header/header'
import Footer from '../../Common/footer/Footer'
import { getExperimentById } from '../../../utils/experimentUtils'
import Experiment_1 from '../Experiments/Experiment_1'
import './Experiment_main_page.css'

function ExperimentMainPage({ experiment: initialExperiment, onBack, user, onLogout, expId: propExpId }) {
    const navigate = useNavigate()
    const params = useParams()
    const location = useLocation()
    const [experiment, setExperiment] = useState(initialExperiment || null)

    const targetId = propExpId || params.id || location.pathname.match(/\/experiment(?:_|\/)([^\/_]+)/)?.[1] || '1'

    useEffect(() => {
        if (!initialExperiment) {
            fetch(`http://localhost:3003/api/experiments/${targetId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.experiment) {
                        setExperiment(data.experiment)
                    } else {
                        setExperiment(getExperimentById(targetId))
                    }
                })
                .catch(() => {
                    setExperiment(getExperimentById(targetId))
                })
        } else {
            setExperiment(initialExperiment)
        }
    }, [initialExperiment, targetId])

    const handleBackNav = () => {
        if (onBack) {
            onBack()
        } else {
            const expId = experiment?.experimentId || experiment?.id || targetId || 1
            navigate(`/experiment_${expId}`)
        }
    }

    // Navigation & Modal State
    const [activeTab, setActiveTab] = useState('experiment') // 'instruction' | 'experiment' | 'observation' | 'result'
    const [showInstructionModal, setShowInstructionModal] = useState(false)

    if (!experiment) return null

    // Determine numerical experiment ID (e.g. 1, 2, 3...)
    const currentNumericId = Number(experiment.experimentId || experiment.id || targetId)

    return (
        <div className="vlab-experiment-page">
            <Header title="Virtual Pharmacology Laboratory" user={user} onLogout={onLogout} />

            <main className="vlab-main-container">
                {/* Unified Parent Container Card */}
                <div className="vlab-parent-card">
                    {/* Top Header Row (Back Button + Red Banner on Same Line) */}
                    <div className="vlab-header-row">
                        <button className="vlab-back-btn" onClick={handleBackNav}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            <span>Back</span>
                        </button>

                        <div className="vlab-red-banner">
                            <h2>
                                {experiment.info
                                    ? experiment.info.toUpperCase()
                                    : experiment.title
                                    ? experiment.title.toUpperCase()
                                    : `EXPERIMENT #${currentNumericId}`}
                            </h2>
                        </div>
                    </div>

                    {/* Check if experiment component is Experiment 1 or other */}
                    {currentNumericId === 1 ? (
                        <>
                            {/* Sub-Header Navigation Tabs */}
                            <div className="vlab-nav-tabs-bar">
                                <div className="vlab-segmented-tab-pill">
                                    <button
                                        type="button"
                                        className={`vlab-tab-pill-btn ${activeTab === 'instruction' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('instruction')}
                                    >
                                        Instruction
                                    </button>
                                    <button
                                        type="button"
                                        className={`vlab-tab-pill-btn ${activeTab === 'experiment' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('experiment')}
                                    >
                                        Experiment
                                    </button>
                                    <button
                                        type="button"
                                        className={`vlab-tab-pill-btn ${activeTab === 'observation' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('observation')}
                                    >
                                        Observation
                                    </button>
                                    <button
                                        type="button"
                                        className={`vlab-tab-pill-btn ${activeTab === 'result' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('result')}
                                    >
                                        Result
                                    </button>
                                </div>
                            </div>

                            {/* Main Stage Content View Area - Experiment 1 */}
                            <div className="vlab-stage-container">
                                <Experiment_1
                                    experiment={experiment}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    showInstructionModal={showInstructionModal}
                                    setShowInstructionModal={setShowInstructionModal}
                                />
                            </div>
                        </>
                    ) : (
                        /* Render "Data Not Found" for other experiments */
                        <div className="not-found-experiment-card">
                            <div className="not-found-icon">🧪</div>
                            <h3>Experiment Data Not Found</h3>
                            <p>
                                The interactive virtual simulation for <strong>"{experiment.title}"</strong> (Experiment #{currentNumericId}) is currently under development or not available yet.
                            </p>
                            <button className="vlab-back-btn" onClick={handleBackNav}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                <span>Back to Experiment Info</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer showBadges={false} />
        </div>
    )
}

export default ExperimentMainPage
