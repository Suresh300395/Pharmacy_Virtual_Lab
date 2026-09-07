import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Header from '../../Common/header/header'
import Footer from '../../Common/footer/Footer'
import Button from '../../Common/button/Button'
import { getExperimentById } from '../../../utils/experimentUtils'
import './welcome_page.css'

function WelcomePage({ experiment: initialExperiment, user, onLogout, expId: propExpId }) {
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

    if (!experiment) return null

    const expId = experiment.experimentId || experiment.id || targetId || 1

    return (
        <div className="welcome-experiment-page">
            <Header title="Virtual Lab Experiment" user={user} onLogout={onLogout} />

            <main className="welcome-main-container">
                {/* Navigation / Back Button */}
                <div className="top-nav-bar">
                    <button className="back-dashboard-btn" onClick={() => navigate('/student')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                {/* Experiment Hero Header Card */}
                <div className="welcome-hero-card">
                    <div className="hero-badge-tag">
                        <span>Experiment #{expId}</span>
                    </div>
                    <h1 className="hero-experiment-title">{experiment.title}</h1>
                    <p className="hero-experiment-subtitle">
                        Welcome to the virtual simulation module. Read the objectives and guidelines below before launching the interactive laboratory apparatus.
                    </p>

                    <div className="hero-actions">
                        <Button
                            className="launch-lab-btn"
                            onClick={() => navigate(`/experiment_${expId}_run`)}
                        >
                            Perform Experiment
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* Content Grid: Instructions first, followed by Equipment and Scientific Principle */}
                <div className="experiment-info-grid">
                    {/* Steps / Instructions Card (First) */}
                    <div className="info-card full-width">
                        <div className="info-card-header">
                            <div className="icon-wrap gold">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 11 12 14 22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                            </div>
                            <h3>Step-by-Step Instructions</h3>
                        </div>
                        <div className="info-card-body">
                            <ol className="instructions-list">
                                {Array.isArray(experiment.instructions) && experiment.instructions.length > 0 ? (
                                    experiment.instructions.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))
                                ) : (
                                    <>
                                        <li>Review the theoretical principle and apparatus setup.</li>
                                        <li>Click <strong>Perform Experiment</strong> to launch the interactive apparatus.</li>
                                        <li>Administer doses, adjust parameters, and record response data in the virtual lab notebook.</li>
                                        <li>Analyze results and generate final lab report.</li>
                                    </>
                                )}
                            </ol>
                        </div>
                    </div>

                    {/* Equipment Card (Second) */}
                    <div className="info-card">
                        <div className="info-card-header">
                            <div className="icon-wrap blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="6" />
                                    <circle cx="12" cy="12" r="2" />
                                </svg>
                            </div>
                            <h3>Equipment</h3>
                        </div>
                        <div className="info-card-body">
                            <p>
                                {experiment.equipment || 'Rotarod apparatus has a horizontal grooved rod rotating at a fixed speed. The mice are made to balance on this rod. Dependent upon their motor co-ordination, Central nervous activity and grip strength the animal either stay on the rotating rod for specific time and after that fall down on the platform of each compartment. The floor of each compartment has sensors that deactivate the timers and the exact fall off time for each rat is displayed on the respective display.'}
                            </p>
                            {experiment.equipmentImage && (
                                <div className="info-card-img-wrap">
                                    <img src={experiment.equipmentImage} alt="Equipment Diagram" className="info-card-img" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Principle Card (Third) */}
                    <div className="info-card">
                        <div className="info-card-header">
                            <div className="icon-wrap purple">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3>Scientific Principle</h3>
                        </div>
                        <div className="info-card-body">
                            <p>
                                {experiment.principle || 'Reduction of motor co-ordination, CNS depression and skeletal muscle relaxation lead to decrease in the fall off time and decrease in number of free ridings of animal balancing on the rotarod. Thus lesser fall off time and less number of free ridings indicate that the administered drug has CNS depressant or muscle relaxant activity that either lead to decrease in the motor co-ordination or decrease in the gripping power.'}
                            </p>
                            {experiment.principleImage && (
                                <div className="info-card-img-wrap">
                                    <img src={experiment.principleImage} alt="Scientific Principle Diagram" className="info-card-img" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer showBadges={false} />
        </div>
    )
}

export default WelcomePage
