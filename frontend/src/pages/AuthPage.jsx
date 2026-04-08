import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import CosmicBackground from '../components/CosmicBackground'
import { Mail, Lock, User, Star, Eye, EyeOff, Loader } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password)
        navigate('/dashboard')
      } else {
        await signUp(form.email, form.password, form.fullName)
        setSuccess('✨ Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CosmicBackground />

      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
      }}>
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'linear-gradient(135deg, rgba(28,17,56,0.95), rgba(18,10,40,0.95))',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '24px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 80px rgba(124,58,237,0.1)',
          animation: 'fadeIn 0.5s ease-out',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}>
              <Star size={28} color="white" fill="white" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #a78bfa, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px',
            }}>Vedix</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {mode === 'signin' ? 'Welcome back, cosmic traveller' : 'Begin your astrological journey'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
            border: '1px solid var(--color-border)',
          }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                id={`auth-tab-${m}`}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '8px',
                  background: mode === m ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: mode === m ? 'white' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label className="label" htmlFor="fullName">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your name"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-dim)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '0.95rem' }}
            >
              {loading ? (
                <><Loader size={16} style={{ animation: 'spin-slow 1s linear infinite' }} /> Please wait…</>
              ) : mode === 'signin' ? (
                <><Star size={16} /> Sign In</>
              ) : (
                <><Star size={16} /> Create Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
            By continuing, you agree to our{' '}
            <span style={{ color: 'var(--color-primary-light)', cursor: 'pointer' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: 'var(--color-primary-light)', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
