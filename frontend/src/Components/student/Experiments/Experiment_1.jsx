import React, { useState, useRef, useEffect } from 'react'
import './Experiment.css'

function Experiment_1({ experiment, activeTab, setActiveTab, showInstructionModal, setShowInstructionModal }) {
    // Video Player Reference
    const videoRef = useRef(null)
    const actophotometerVideoRef = useRef(null)

    // Simulation State
    const [selectedTreatment, setSelectedTreatment] = useState('vehicle') // 'vehicle' | 'drug'
    const [isAdministered, setIsAdministered] = useState(false)
    const [isPlayingActophotometer, setIsPlayingActophotometer] = useState(false)
    const [migratingState, setMigratingState] = useState(false)
    const [showTopMice, setShowTopMice] = useState(true)
    const [vehicleMice, setVehicleMice] = useState(0)
    const [drugMice, setDrugMice] = useState(0)
    const [simulationStatus, setSimulationStatus] = useState('Select treatment and click Administer')

    // Recorded Observations
    const [observations, setObservations] = useState([
        { id: 1, group: 'Vehicle Treated', treatment: 'Control Saline 0.9%', dose: '10 mL/kg', fallTime: '180 sec', status: 'Normal Grip & Motor Activity' },
        { id: 2, group: 'Drug Treated', treatment: 'Diazepam', dose: '1 mg/kg', fallTime: '45 sec', status: 'Significant Reduction in Motor Coordination' }
    ])

    // Auto play video when component mounts/administered state triggers
    useEffect(() => {
        if (isAdministered && videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play().catch((err) => console.log('Autoplay handled:', err))
        }
    }, [isAdministered])

    // Auto play actophotometer video when triggered
    useEffect(() => {
        if (isPlayingActophotometer && actophotometerVideoRef.current) {
            actophotometerVideoRef.current.currentTime = 0
            actophotometerVideoRef.current.play().catch((err) => console.log('Actophotometer autoplay handled:', err))
        }
    }, [isPlayingActophotometer])

    // Handle Drug Selection
    const handleSelectTreatment = (type) => {
        setSelectedTreatment(type)
        setSimulationStatus(`Selected: ${type === 'vehicle' ? 'Vehicle (Control Saline)' : 'Diazepam (1 mg/kg)'}. Click Administer.`)
    }

    // Handle Video Ended (Hide video -> show top mice -> animate 3 to vehicle tray & 3 to drug tray)
    const handleVideoEnded = () => {
        setIsAdministered(false)
        setShowTopMice(true)
        setSimulationStatus('Administration complete. Preparing subject transfer...')

        // Start migration animation after 0.8s
        setTimeout(() => {
            setMigratingState(true)
            setSimulationStatus('Transferring subjects to Vehicle Treated and Drug Treated trays...')
        }, 800)

        // Complete migration after 2.0s total delay
        setTimeout(() => {
            setMigratingState(false)
            setShowTopMice(false)
            setVehicleMice(3)
            setDrugMice(3)
            setSimulationStatus('3 mice transferred to Vehicle Treated tray and 3 mice transferred to Drug Treated tray.')
        }, 2000)
    }

    // Handle Rat Click in Tray (Disappear rats in tray & play actophotometer.mp4 in top section)
    const handleRatClick = (group) => {
        if (group === 'vehicle') {
            setVehicleMice(0)
            setSimulationStatus('Vehicle Treated rats selected. Playing Actophotometer video...')
        } else if (group === 'drug') {
            setDrugMice(0)
            setSimulationStatus('Drug Treated rats selected. Playing Actophotometer video...')
        } else {
            setVehicleMice(0)
            setDrugMice(0)
            setSimulationStatus('Rats selected. Playing Actophotometer video...')
        }
        setIsPlayingActophotometer(true)
    }

    // Handle Administer Click
    const handleAdminister = () => {
        if (!selectedTreatment) {
            setSelectedTreatment('vehicle')
        }
        setVehicleMice(0)
        setDrugMice(0)
        setShowTopMice(true)
        setMigratingState(false)
        setIsAdministered(true)
        setIsPlayingActophotometer(false)
        setSimulationStatus('Administering treatment... Playing video.')
        if (videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play().catch(() => {})
        }
    }

    return (
        <div className="experiment-1-container">
            {/* TAB 1: INSTRUCTION */}
            {activeTab === 'instruction' && (
                <div className="vlab-tab-content intro-content">
                    <h3>Step-by-Step Instructions & Guidelines</h3>
                    <p>
                        Follow the guidelines below to execute the pharmacology simulation:
                    </p>
                    <div className="intro-highlights">
                        {Array.isArray(experiment?.instructions) && experiment.instructions.length > 0 ? (
                            experiment.instructions.map((step, idx) => (
                                <div key={idx} className="highlight-box">
                                    <h4>Step {idx + 1}</h4>
                                    <p>{step}</p>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="highlight-box">
                                    <h4>1. Drug Selection</h4>
                                    <p>Select either <strong>Vehicle (Saline 0.9%)</strong> or <strong>Diazepam (1 mg/kg)</strong> from the bottom test tube rack controls.</p>
                                </div>
                                <div className="highlight-box">
                                    <h4>2. Administration</h4>
                                    <p>Click the <strong>Administer</strong> button to inject the selected compound and place the subjects into respective treatment trays.</p>
                                </div>
                                <div className="highlight-box">
                                    <h4>3. Rotarod Testing</h4>
                                    <p>Run the motor simulation and monitor motor coordination / fall-off times of test subjects on the rotating rod.</p>
                                </div>
                                <div className="highlight-box">
                                    <h4>4. Record & Analyze</h4>
                                    <p>Click <strong>Record Observation</strong> to log trial readings and navigate to the <strong>Observation</strong> and <strong>Result</strong> tabs.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: EXPERIMENT (MAIN INTERACTIVE STAGE) */}
            {activeTab === 'experiment' && (
                <div className="vlab-tab-content experiment-stage">
                    {/* Top Mice Cluster / Administer / Actophotometer Video Player */}
                    <div className="top-mice-cluster">
                        {isAdministered ? (
                            <div className="video-player-wrapper">
                                <video
                                    ref={videoRef}
                                    src="/oral.mp4"
                                    autoPlay
                                    muted
                                    playsInline
                                    onEnded={handleVideoEnded}
                                    className="administer-video-player"
                                />
                            </div>
                        ) : isPlayingActophotometer ? (
                            <div className="video-player-wrapper actophotometer-wrapper">
                                <video
                                    ref={actophotometerVideoRef}
                                    src="/actophotometer.mp4"
                                    autoPlay
                                    muted
                                    playsInline
                                    className="administer-video-player"
                                    onEnded={() => setSimulationStatus('Actophotometer test complete.')}
                                />
                            </div>
                        ) : showTopMice ? (
                            <div className="mice-cloud">
                                <span className={`mouse-icon m1 ${migratingState ? 'migrating-left delay-1' : ''}`}>🐁</span>
                                <span className={`mouse-icon m2 ${migratingState ? 'migrating-left delay-2' : ''}`}>🐁</span>
                                <span className={`mouse-icon m3 ${migratingState ? 'migrating-left delay-3' : ''}`}>🐁</span>
                                <span className={`mouse-icon m4 ${migratingState ? 'migrating-right delay-1' : ''}`}>🐁</span>
                                <span className={`mouse-icon m5 ${migratingState ? 'migrating-right delay-2' : ''}`}>🐁</span>
                                <span className={`mouse-icon m6 ${migratingState ? 'migrating-right delay-3' : ''}`}>🐁</span>
                            </div>
                        ) : (
                            <div className="rotarod-apparatus-wrapper">
                                <img src="/rotarod.jpg" alt="Rotarod Apparatus" className="rotarod-image" />
                            </div>
                        )}
                    </div>

                    {/* Main Interactive Stage Grid (Left Tray - Center Administer - Right Tray) */}
                    <div className="interactive-apparatus-layout">
                        {/* Left Tray: Vehicle Treated */}
                        <div className="tray-column">
                            <div className="tray-header-pill">Vehicle Treated</div>
                            <div className="white-tray-box">
                                <div className="tray-inner">
                                    {vehicleMice > 0 ? (
                                        <div className="tray-mice-list">
                                            {Array.from({ length: vehicleMice }).map((_, i) => (
                                                <span
                                                    key={i}
                                                    className="tray-mouse clickable-rat"
                                                    onClick={() => handleRatClick('vehicle')}
                                                    title="Click rat to test in Actophotometer"
                                                >
                                                    🐁
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="tray-empty-text">Tray Empty</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Center Control Panel */}
                        <div className="center-controls-column">
                            {vehicleMice > 0 || drugMice > 0 ? (
                                <div className="select-group-info-pill">
                                    <span>Click on any rat in the tray to test in Actophotometer</span>
                                </div>
                            ) : (
                                <button className="administer-btn" onClick={handleAdminister}>
                                    Administer
                                </button>
                            )}
                        </div>

                        {/* Right Tray: Drug Treated */}
                        <div className="tray-column">
                            <div className="tray-header-pill">Drug Treated</div>
                            <div className="white-tray-box">
                                <div className="tray-inner">
                                    {drugMice > 0 ? (
                                        <div className="tray-mice-list">
                                            {Array.from({ length: drugMice }).map((_, i) => (
                                                <span
                                                    key={i}
                                                    className="tray-mouse relaxed clickable-rat"
                                                    onClick={() => handleRatClick('drug')}
                                                    title="Click rat to test in Actophotometer"
                                                >
                                                    🐁
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="tray-empty-text">Tray Empty</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Test Tube Rack Controls */}
                    <div className="test-tubes-row">
                        {/* Left Tube: Vehicle */}
                        <div className="tube-rack-group">
                            <div className="tube-rack-graphic">
                                <div className="tubes">
                                    <span className="tube">🧪</span>
                                    <span className="tube">🧪</span>
                                    <span className="tube">🧪</span>
                                </div>
                                <div className="rack-stand"></div>
                            </div>
                            <button
                                className={`treatment-btn ${selectedTreatment === 'vehicle' ? 'selected' : ''}`}
                                onClick={() => handleSelectTreatment('vehicle')}
                            >
                                Vehicle
                            </button>
                        </div>

                        {/* Right Tube: Diazepam */}
                        <div className="tube-rack-group">
                            <div className="tube-rack-graphic">
                                <div className="tubes">
                                    <span className="tube">🧪</span>
                                    <span className="tube">🧪</span>
                                    <span className="tube">🧪</span>
                                </div>
                                <div className="rack-stand"></div>
                            </div>
                            <button
                                className={`treatment-btn ${selectedTreatment === 'drug' ? 'selected' : ''}`}
                                onClick={() => handleSelectTreatment('drug')}
                            >
                                Diazepam (1Mg/Kg)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: OBSERVATION */}
            {activeTab === 'observation' && (
                <div className="vlab-tab-content observation-content">
                    <h3>Observation Table</h3>
                    <div className="obs-table-wrapper">
                        <table className="vlab-obs-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Animal Group</th>
                                    <th>Treatment</th>
                                    <th>Dose Concentration</th>
                                    <th>Fall-Off Time (sec)</th>
                                    <th>Inference / Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {observations.map((obs, idx) => (
                                    <tr key={idx}>
                                        <td>{obs.id}</td>
                                        <td className="font-semibold">{obs.group}</td>
                                        <td>{obs.treatment}</td>
                                        <td>{obs.dose}</td>
                                        <td className="highlight-time">{obs.fallTime}</td>
                                        <td>{obs.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: RESULT */}
            {activeTab === 'result' && (
                <div className="vlab-tab-content result-content">
                    <h3>Experimental Result & Conclusion</h3>
                    <div className="result-card-box">
                        <p>
                            Administration of <strong>Diazepam (1 mg/kg)</strong> produced a significant reduction in the fall-off time on the Rotarod apparatus compared to the Vehicle-treated control group.
                        </p>
                        <div className="result-stats">
                            <div className="stat-badge">
                                <span className="lbl">Vehicle Avg Fall Time</span>
                                <span className="val">180 seconds</span>
                            </div>
                            <div className="stat-badge alert">
                                <span className="lbl">Diazepam Avg Fall Time</span>
                                <span className="val">42 seconds</span>
                            </div>
                        </div>
                        <div className="final-conclusion">
                            <strong>Conclusion:</strong> Diazepam exhibits marked CNS depressant and skeletal muscle relaxant activity in mice.
                        </div>
                    </div>
                </div>
            )}

            {/* Instruction Modal */}
            {showInstructionModal && (
                <div className="vlab-modal-overlay" onClick={() => setShowInstructionModal(false)}>
                    <div className="vlab-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Step-by-Step Instructions</h3>
                            <button className="close-modal-btn" onClick={() => setShowInstructionModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <ol className="vlab-instruction-steps">
                                <li>Select the drug treatment by clicking on either <strong>Vehicle</strong> or <strong>Diazepam (1Mg/Kg)</strong> test tube button at the bottom.</li>
                                <li>Click the <strong>Administer</strong> button in the center to inject the selected drug into the animals.</li>
                                <li>Observe the mice being transferred to the respective <strong>Vehicle Treated</strong> or <strong>Drug Treated</strong> trays.</li>
                                <li>Click <strong>Record Observation</strong> to log the fall-off time data into the Observation Table.</li>
                                <li>Navigate to the <strong>Observation</strong> and <strong>Result</strong> tabs at the top to view final data analysis.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Experiment_1
