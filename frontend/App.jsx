import { useState, useEffect } from 'react'
import axios from 'axios'
import AuthFlow from './components/AuthFlow'
import DashBoard from './components/DashBoard'
import './App.css'

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

function App() {
  const [st, setSt] = useState('idle') // idle, reg, auth, dash
  const [uid, setUid] = useState('')
  const [err, setErr] = useState('')

  const GoReg = () => {
    setSt('reg')
    setErr('')
  }

  const GoAuth = () => {
    setSt('auth')
    setErr('')
  }

  const OnRegOk = (newUid) => {
    setUid(newUid)
    setSt('dash')
  }

  const OnRegErr = (msg) => {
    setErr(msg)
  }

  const OnAuthOk = () => {
    setSt('dash')
  }

  const OnAuthErr = (msg) => {
    setErr(msg)
  }

  const OnLogout = () => {
    setSt('idle')
    setUid('')
    setErr('')
  }

  return (
    <div className="app">
      {st === 'idle' && (
        <div className="landing anim-slide">
          <div className="landing-hero">
            <h1>NeuroCrypt</h1>
            <p className="subtitle">Cognitive-Behavioral Authentication for Medical Privacy</p>
            <p className="subtext">Your brain is your password. Unhackable. Unclonable. Unique.</p>
          </div>
          
          <div className="landing-info">
            <div className="info-card glass-lg">
              <div className="card-accent"></div>
              <h3>What is it?</h3>
              <p>A software-based behavioral biometric system that authenticates users based on their unique cognitive-behavioral fingerprint. No hardware required.</p>
            </div>
            
            <div className="info-card glass-lg">
              <div className="card-accent"></div>
              <h3>How it works</h3>
              <p>During a 60-second adaptive micro-test, we capture your cognitive behavior patterns including response latency, keystroke dynamics, and decision timing.</p>
            </div>

            <div className="info-card glass-lg">
              <div className="card-accent"></div>
              <h3>Why it matters</h3>
              <p>Medical identity theft affects millions. Traditional auth fails. Your brain's behavior is your unique, unclonable signature.</p>
            </div>
          </div>

          <div className="cta gap-2">
            <button className="btn-primary btn-lg" onClick={GoReg}>
              <span className="btn-label">Create Cognitive Signature</span>
              <span className="btn-sublabel">60-second enrollment</span>
            </button>
            <button className="btn-secondary btn-lg" onClick={GoAuth}>
              <span className="btn-label">Verify Identity</span>
              <span className="btn-sublabel">Authenticate with your signature</span>
            </button>
          </div>

          {err && <div className="err-box">{err}</div>}
        </div>
      )}

      {st === 'reg' && (
        <AuthFlow
          mode="register"
          onSuccess={OnRegOk}
          onError={OnRegErr}
          api={API}
        />
      )}

      {st === 'auth' && (
        <AuthFlow
          mode="authenticate"
          onSuccess={OnAuthOk}
          onError={OnAuthErr}
          api={API}
        />
      )}

      {st === 'dash' && (
        <DashBoard
          uid={uid}
          onLogout={OnLogout}
          api={API}
        />
      )}
    </div>
  )
}

export default App
