import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Star, Moon, LogOut, User, MessageCircle, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(10, 6, 18, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
          }}>
            <Star size={20} color="white" fill="white" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #a78bfa, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Vedix
          </span>
        </Link>

        {/* Nav Links (authenticated) */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { path: '/chart', label: 'My Chart', icon: Moon },
              { path: '/chat', label: 'Chat', icon: MessageCircle },
            ].map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: isActive(path) ? 'white' : 'var(--color-text-muted)',
                  background: isActive(path) ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                id="user-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '20px',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{
                  width: '28px', height: '28px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={14} color="white" />
                </div>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email?.split('@')[0]}
                </span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '44px', right: '0',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '160px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  zIndex: 200,
                }}>
                  <button
                    id="sign-out-btn"
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <button className="btn-primary" id="nav-login-btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                Get Started
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
