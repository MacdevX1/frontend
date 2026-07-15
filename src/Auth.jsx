import { useState } from 'react'
import './Auth.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fadeIn, setFadeIn] = useState(true)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const route = mode === 'login' ? 'login' : 'register'

    try {
      const response = await fetch(`${API_BASE}/${route}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      onAuthenticated(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authPage">
<div className={`authCard ${fadeIn ? 'fadeIn' : 'fadeOut'}`}>
        <h1>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
        <p>{mode === 'login' ? 'Access your Abhigpt chats' : 'Register to save your conversations'}</p>

        <form onSubmit={handleSubmit} className="authForm">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
              minLength={6}
            />
          </label>

          {error && <p className="authError">{error}</p>}

          <button type="submit" disabled={loading} className="authButton">
            {loading ? 'Working...' : mode === 'login' ? 'Sign In' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          className="authToggle"
          onClick={() => {
            setFadeIn(false)
            setTimeout(() => {
              setMode((current) => (current === 'login' ? 'register' : 'login'))
              setFadeIn(true)
              setError(null)
            }, 180)
          }}
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  )
}

export default Auth
