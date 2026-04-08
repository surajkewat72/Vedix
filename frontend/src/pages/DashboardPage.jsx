import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useChartStore } from '../stores/chartStore'
import CosmicBackground from '../components/CosmicBackground'
import BirthForm from '../components/BirthForm'
import { Moon, MessageCircle, Star, ArrowRight, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { chart, hasBirthDetails, loading, fetchMyChart } = useChartStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyChart()
  }, [])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cosmic Traveller'

  const quickActions = [
    { path: '/chart', icon: Moon, label: 'View Birth Chart', desc: 'See all planetary positions', color: '#7c3aed' },
    { path: '/chat', icon: MessageCircle, label: 'Chat with AI', desc: 'Ask your astrologer anything', color: '#a855f7' },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CosmicBackground />

      <div style={{ position: 'relative', zIndex: 1, padding: '100px 24px 60px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '40px', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '6px' }}>
            Namaste ✨
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'white', marginBottom: '8px' }}>
            Welcome, {displayName}
          </h1>
          {hasBirthDetails && chart && (
            <p style={{ color: 'var(--color-text-muted)' }}>
              ☀️ <strong style={{ color: 'var(--color-accent)' }}>{chart.sun?.sign} Sun</strong>
              {' · '}
              🌙 <strong style={{ color: 'var(--color-primary-light)' }}>{chart.moon?.sign} Moon</strong>
              {' · '}
              ⬆️ <strong style={{ color: 'var(--color-accent-teal)' }}>{chart.ascendant?.sign} Rising</strong>
            </p>
          )}
        </div>

        {/* Main content */}
        {!hasBirthDetails ? (
          /* Birth details onboarding */
          <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08))',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '20px',
              padding: '36px',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌟</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>
                Let's Cast Your Birth Chart
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', maxWidth: '420px', margin: '0 auto 32px', lineHeight: '1.6' }}>
                Your personalized Vedic birth chart is the foundation of your cosmic journey.
                Enter your birth details below to get started.
              </p>
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <BirthForm onSuccess={() => navigate('/chart')} />
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard with chart data */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.6s ease-out' }}>
            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {quickActions.map(({ path, icon: Icon, label, desc, color }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '24px', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${color}60` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ width: '44px', height: '44px', background: `${color}20`, border: `1px solid ${color}40`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={color} />
                      </div>
                      <ArrowRight size={18} color="var(--color-text-dim)" />
                    </div>
                    <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{desc}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Big 3 */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Sparkles size={18} color="var(--color-accent-gold)" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'white' }}>Your Big Three</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { emoji: '☀️', label: 'Sun Sign', value: chart.sun?.sign, sub: 'Your core self' },
                  { emoji: '🌙', label: 'Moon Sign', value: chart.moon?.sign, sub: 'Your emotions' },
                  { emoji: '⬆️', label: 'Rising Sign', value: chart.ascendant?.sign, sub: 'How others see you' },
                ].map(({ emoji, label, value, sub }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '20px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{emoji}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-accent)', fontWeight: '600', marginBottom: '4px' }}>{value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat CTA */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08))',
              border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
            }}>
              <div>
                <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔮 Your AI Astrologer is waiting
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Ask about your relationships, career, life purpose, and more.
                </div>
              </div>
              <Link to="/chat">
                <button className="btn-primary" id="dashboard-chat-cta">
                  <MessageCircle size={16} />
                  Start Chatting
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
