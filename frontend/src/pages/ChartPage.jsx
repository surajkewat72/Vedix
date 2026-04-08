import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useChartStore } from '../stores/chartStore'
import CosmicBackground from '../components/CosmicBackground'
import ZodiacWheel from '../components/ZodiacWheel'
import PlanetCard from '../components/PlanetCard'
import BirthForm from '../components/BirthForm'
import { RefreshCw, MessageCircle, Star, MapPin, Calendar } from 'lucide-react'

export default function ChartPage() {
  const { chart, hasBirthDetails, loading, fetchMyChart } = useChartStore()
  const [activeTab, setActiveTab] = useState('planets')
  const navigate = useNavigate()

  useEffect(() => { fetchMyChart() }, [])

  const planets = chart ? [
    chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars,
    chart.jupiter, chart.saturn, chart.uranus, chart.neptune, chart.pluto,
  ].filter(Boolean) : []

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CosmicBackground />

      <div style={{ position: 'relative', zIndex: 1, padding: '90px 24px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease-out' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'white', marginBottom: '8px' }}>
            🌌 Your Vedic Birth Chart
          </h1>
          {chart && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <span><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />{chart.birth_date}</span>
              <span>⏰ {chart.birth_time}</span>
              <span><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />{chart.birth_city}</span>
              <span>✨ {chart.zodiac_type} (Lahiri)</span>
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(124,58,237,0.3)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin-slow 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Loading your chart…</p>
          </div>
        )}

        {!loading && !hasBirthDetails && (
          <div className="card" style={{ padding: '40px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌟</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', marginBottom: '12px' }}>No Chart Found</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px' }}>Enter your birth details to generate your personalized Vedic chart.</p>
            <BirthForm onSuccess={() => {}} />
          </div>
        )}

        {!loading && hasBirthDetails && chart && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 420px) 1fr', gap: '28px', alignItems: 'start' }}>
            {/* Left: Wheel */}
            <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
              <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-accent)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Natal Wheel
                </h2>
                <ZodiacWheel chart={chart} />

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { color: '#f97316', label: 'Fire' },
                    { color: '#22c55e', label: 'Earth' },
                    { color: '#eab308', label: 'Air' },
                    { color: '#3b82f6', label: 'Water' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat CTA */}
              <Link to="/chat" style={{ textDecoration: 'none', display: 'block', marginTop: '16px' }}>
                <button className="btn-primary" id="chart-chat-btn" style={{ width: '100%', padding: '13px' }}>
                  <MessageCircle size={16} />
                  Discuss with AI Astrologer
                </button>
              </Link>
            </div>

            {/* Right: Details */}
            <div style={{ animation: 'fadeIn 0.7s ease-out' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
                {['planets', 'houses', 'summary'].map(tab => (
                  <button
                    key={tab}
                    id={`chart-tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px',
                      background: activeTab === tab ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
                      border: 'none',
                      color: activeTab === tab ? 'white' : 'var(--color-text-muted)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      fontWeight: '500', fontSize: '0.8rem',
                      textTransform: 'capitalize', transition: 'all 0.2s',
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'planets' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {planets.map((p, i) => <PlanetCard key={i} planet={p} />)}
                </div>
              )}

              {activeTab === 'houses' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {(chart.houses || []).map((h) => (
                    <div key={h.number} style={{ padding: '14px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>House {h.number}</div>
                      <div style={{ fontWeight: '600', color: 'var(--color-accent)', fontSize: '0.95rem' }}>{h.sign}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{h.position.toFixed(1)}°</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="card" style={{ padding: '20px' }}>
                  <pre style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.7',
                    margin: 0,
                  }}>
                    {chart.chart_summary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
