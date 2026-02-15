import React, { useState, useEffect } from 'react'
import { Camera, Upload, Leaf, Thermometer, Droplets, Sun, Info, Heart, AlertTriangle, Moon, SunMedium } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

function App() {
  const [image, setImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result)
        startAnalysis(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const startAnalysis = async (file) => {
    setAnalyzing(true)
    setResult(null)

    // Convert file to base64
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      setResult({
        plant_name: "Analysis Error",
        is_healthy: false,
        summary: error.message || "We couldn't analyze your plant. Please try again later.",
        care_instructions: { light: "N/A", water: "N/A", environment: "N/A", temperature: "N/A" },
        diagnostics: {
          status: "Error",
          description: "There was a problem processing your request.",
          recommendations: ["Check your internet connection", "Try a different image", "Ensure the file size is not too large"]
        }
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setImage(null)
    setResult(null)
  }

  return (
    <div className="app-container">
      <header className="header" style={{ position: 'relative' }}>
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '10px'
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunMedium size={24} /> : <Moon size={24} />}
        </button>
        <h1>Garden Doctor (v1.1)</h1>
        <p>Your AI botanical companion</p>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {!image && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card scanner-area"
            >
              <div className="camera-preview">
                <Leaf size={64} color="var(--sage-medium)" />
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                Take a photo or upload an image of your plant to analyze its health.
              </p>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary">
                  <Camera size={20} />
                  Scan Plant
                </button>
                <label className="btn btn-secondary">
                  <Upload size={20} />
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </motion.div>
          )}

          {image && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
            >
              <div className="camera-preview" style={{ border: 'none' }}>
                <img src={image} alt="Plant preview" className="preview-img" />
                {analyzing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="loader">Analyzing...</div>
                  </div>
                )}
              </div>

              {!analyzing && result && (
                <div className="result-section">
                  <div className={`badge ${result.is_healthy ? 'badge-healthy' : 'badge-sick'}`}>
                    {result.is_healthy ? (
                      <><Heart size={12} style={{ marginRight: '4px' }} /> Healthy</>
                    ) : (
                      <><AlertTriangle size={12} style={{ marginRight: '4px' }} /> Action Required</>
                    )}
                  </div>

                  <h2>{result.plant_name || "Unknown Plant"}</h2>
                  <p className="plant-summary">{result.summary || "No summary available."}</p>

                  <div className="status-banner" style={{
                    marginTop: '10px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--sage-light)',
                    borderLeft: `4px solid ${result.is_healthy ? 'var(--accent-leaf)' : 'var(--error)'}`,
                    fontSize: '0.85rem'
                  }}>
                    <strong style={{ color: result.is_healthy ? 'var(--accent-leaf)' : 'var(--error)' }}>Diagnosis:</strong> {result.diagnostics?.status || (result.is_healthy ? "Healthy" : "Unknown Condition")}
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <label><Sun size={12} /> Light</label>
                      <p>{result.care_instructions?.light || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label><Droplets size={12} /> Water</label>
                      <p>{result.care_instructions?.water || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label><Leaf size={12} /> Place</label>
                      <p>{result.care_instructions?.environment || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label><Thermometer size={12} /> Temp</label>
                      <p>{result.care_instructions?.temperature || "N/A"}</p>
                    </div>
                  </div>

                  <div className="recommendations">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                      {result.is_healthy ? "Maintenance Advice" : "Treatment Plan"}
                    </h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px', opacity: 0.9 }}>{result.diagnostics?.description || ""}</p>
                    <ul>
                      {result.diagnostics?.recommendations?.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      )) || (result.is_healthy ? <li>No specific actions needed.</li> : <li>Consult a professional if symptoms worsen.</li>)}
                    </ul>
                  </div>

                  <button className="btn btn-secondary" onClick={reset} style={{ marginTop: '20px' }}>
                    Scan Another
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '20px', fontSize: '0.8rem', opacity: 0.6 }}>
        &copy; 2026 Garden Doctor AI
      </footer>
    </div>
  )
}

export default App
