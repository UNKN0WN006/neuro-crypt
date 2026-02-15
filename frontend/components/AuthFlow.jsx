import { useState, useRef } from 'react'
import './AuthFlow.css'

function AuthFlow({ mode, onSuccess, onError, api }) {
  const [uid, setUid] = useState('')
  const [running, setRunning] = useState(false)
  const [prog, setProg] = useState(0)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  
  const cntRef = useRef(0)
  const tRef = useRef(0)
  const kstRef = useRef([])
  const latRef = useRef([])
  const xRef = useRef(0)
  const yRef = useRef(0)

  const isReg = mode === 'register'
  const title = isReg ? 'Create Cognitive Signature' : 'Behavioral Authentication'
  const btnText = isReg ? 'Begin Enrollment Test' : 'Begin Authentication Test'

  const StartTest = async () => {
    if (!uid.trim()) {
      setErr('Please enter a user ID')
      return
    }

    setErr('')
    setMsg('')
    setRunning(true)
    setProg(0)
    cntRef.current = 0
    latRef.current = []
    kstRef.current = []
    tRef.current = Date.now()

    const dur = 60000
    const itv = setInterval(() => {
      const elap = Date.now() - tRef.current
      const pct = Math.min((elap / dur) * 100, 100)
      setProg(pct)

      if (pct >= 100) {
        clearInterval(itv)
        EndTest()
      }
    }, 100)
  }

  const EndTest = async () => {
    setRunning(false)
    
    try {
      // Get synthetic features from backend
      const res = await api.post('/demo/inject', { mode: 'normal' }, {
        timeout: 10000
      })
      const svrFeats = res.data.feats
      
      if (isReg) {
        // Registration flow
        await api.post('/auth/register', {
          uid: uid.trim(),
          feats: svrFeats,
          ts: Date.now()
        }, {
          timeout: 10000
        })
        setMsg('Cognitive signature established successfully!')
        setTimeout(() => onSuccess(uid), 1200)
      } else {
        // Authentication flow
        const auth = await api.post('/auth/verify', {
          uid: uid.trim(),
          feats: svrFeats
        }, {
          timeout: 10000
        })
        
        if (auth.data.authenticated) {
          setMsg(`Identity verified. Anomaly: ${(auth.data.anomaly_score * 100).toFixed(1)}%`)
          setTimeout(() => onSuccess(), 1200)
        } else {
          setErr(`Authentication failed. Anomaly detected: ${(auth.data.anomaly_score * 100).toFixed(1)}%`)
        }
      }
    } catch (e) {
      const errMsg = e.response?.data?.err || e.message || 'Network error'
      setErr(`Error: ${errMsg}. Ensure the backend is running (Vite proxies /api to port 5000).`)
      console.error('API Error:', e)
    }
  }

  const OnKstrike = (e) => {
    if (running) {
      const now = Date.now()
      kstRef.current.push(now)
      latRef.current.push(now - tRef.current)
      cntRef.current += 1
    }
  }

  const OnMouse = (e) => {
    if (running) {
      const nx = e.clientX
      const ny = e.clientY
      if (xRef.current > 0 && yRef.current > 0) {
        const dx = nx - xRef.current
        const dy = ny - yRef.current
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 300) {
          latRef.current.push(dist / 100)
        }
      }
      xRef.current = nx
      yRef.current = ny
    }
  }

  return (
    <div className={`auth-flow anim-slide ${isReg ? 'mode-enrollment' : 'mode-auth'}`} onKeyDown={OnKstrike} onMouseMove={OnMouse} tabIndex={0}>
      <div className="auth-card glass-lg">
        <div className="auth-header">
          <div className="mode-badge">{isReg ? 'Enrollment' : 'Verification'}</div>
          <h2>{title}</h2>
        </div>

        <div className="form-group">
          <label>User ID</label>
          <input
            type="text"
            placeholder={isReg ? 'Choose your ID' : 'Enter your ID'}
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            disabled={running}
            onKeyPress={(e) => e.key === 'Enter' && !running && StartTest()}
          />
        </div>

        {!running && !msg && (
          <button className="btn-primary full" onClick={StartTest}>
            {btnText}
          </button>
        )}

        {running && (
          <div className="test-container">
            <div className="prog-label">
              {isReg ? 'Capturing baseline...' : 'Analyzing behavior...'}
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${prog}%` }}></div>
              <div className="prog-glow"></div>
            </div>
            <div className="prog-text">{Math.round(prog)}%</div>
            <div className="test-activity">
              <span className="activity-dot pulse"></span>
              <p className="test-hint">Move mouse and interact naturally</p>
            </div>
          </div>
        )}

        {msg && (
          <div className="success-box anim-scale">
            <div className="success-icon">✓</div>
            <div className="status-ok">{msg}</div>
          </div>
        )}

        {err && (
          <div className="error-box anim-scale">
            <div className="error-icon">✕</div>
            <div className="status-err">{err}</div>
          </div>
        )}

        <div className="info-small">
          <p><strong>Signals Captured:</strong></p>
          <p>Response latency • Keystroke rhythm • Mouse dynamics • Decision timing</p>
        </div>
      </div>
    </div>
  )
}

export default AuthFlow
