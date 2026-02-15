import { useState, useEffect } from 'react'
import './DashBoard.css'

function DashBoard({ uid, onLogout, api }) {
  const [stat, setStat] = useState(null)
  const [load, setLoad] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/auth/status?uid=${uid}`, {
          timeout: 10000
        })
        setStat(res.data)
        setLoad(false)
      } catch (e) {
        setErr('Failed to load user profile')
        setLoad(false)
      }
    }
    fetch()
  }, [uid, api])

  const OnLogout = async () => {
    try {
      await api.post('/auth/logout', { uid }, {
        timeout: 10000
      })
      onLogout()
    } catch (e) {
      setErr('Logout failed')
    }
  }

  if (load) {
    return (
      <div className="dashboard anim-slide">
        <div className="dash-card glass-lg">
          <p className="pulse">Loading cognitive profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard anim-slide">
      <div className="dash-card glass-lg">
        <div className="dash-header">
          <h2>Cognitive Profile</h2>
          <div className="auth-badge">Verified</div>
        </div>
        
        {stat && (
          <div className="stats-grid">
            <div className="stat-item glass">
              <div className="stat-label">User ID</div>
              <div className="stat-val">{stat.uid}</div>
            </div>
            
            <div className="stat-item glass">
              <div className="stat-label">Status</div>
              <div className="stat-val status-ok">✓ Active</div>
            </div>
            
            <div className="stat-item glass">
              <div className="stat-label">Authentications</div>
              <div className="stat-val">{stat.auth_attempts}</div>
            </div>
            
            <div className="stat-item glass">
              <div className="stat-label">Signature Dimensions</div>
              <div className="stat-val">{stat.baseline_feats}</div>
            </div>
          </div>
        )}

        <div className="info-section glass">
          <h3>Your Neural Signature</h3>
          <p>Your unique cognitive-behavioral pattern has been established and protected.</p>
          <ul>
            <li>Neurologically unique (tied to your brain function)</li>
            <li>Non-transferable (can't be shared)</li>
            <li>Unclonable (behavioral biometrics resist spoofing)</li>
            <li>Encrypted (only embeddings stored)</li>
          </ul>
        </div>

        <div className="research-section glass">
          <h3>Future Research Potential</h3>
          <p>This technology enables breakthrough capabilities:</p>
          <ul>
            <li><strong>Cognitive Monitoring:</strong> Track early signs of neurological changes</li>
            <li><strong>Health Analytics:</strong> Behavioral shifts indicate stress or illness</li>
            <li><strong>Continuous Auth:</strong> Real-time identity verification</li>
            <li><strong>Preventive Medicine:</strong> Early intervention based on behavior</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={OnLogout}>Logout</button>
        </div>

        {err && <div className="error-box">{err}</div>}
      </div>
    </div>
  )
}

export default DashBoard
