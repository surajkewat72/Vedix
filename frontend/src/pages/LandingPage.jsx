import { Link } from 'react-router-dom'
import CosmicBackground from '../components/CosmicBackground'
import { Star, MessageCircle, Moon, Zap, Shield, Globe, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: Moon,
    title: 'Vedic Birth Chart',
    desc: 'Precise Sidereal calculations using Swiss Ephemeris. Sun, Moon, rising sign, all planets and houses.',
    color: '#7c3aed',
  },
  {
    icon: MessageCircle,
    title: 'AI Astrologer Chat',
    desc: 'Powered by llama3 running locally on your device. Ask anything — 100% private, no data leaves your machine.',
    color: '#a855f7',
  },
  {
    icon: Zap,
    title: 'Voice Interaction',
    desc: "Speak your questions and hear the AI's answers. Hands-free cosmic guidance using your browser's voice APIs.",
    color: '#c084fc',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    desc: 'Your chart and conversations stay on your device. No third-party AI APIs, no data mining.',
    color: '#f59e0b',
  },
  {
    icon: Globe,
    title: 'Global Geocoding',
    desc: 'Born anywhere in the world? We automatically find your birth city coordinates for accurate calculations.',
    color: '#2dd4bf',
  },
  {
    icon: Star,
    title: 'Completely Free',
    desc: 'Built entirely on open-source tools. No subscriptions, no premium tiers, no credit card required.',
    color: '#4ade80',
  },
]

const TESTIMONIALS = [
  { name: 'Priya S.', sign: 'Scorpio Rising', text: 'The AI astrologer gave me insights my chart reader of 10 years never uncovered. Truly remarkable.' },
  { name: 'Arav M.', sign: 'Leo Sun, Pisces Moon', text: 'I love that it knows my whole chart and gives personalized guidance, not generic horoscopes.' },
  { name: 'Sofia K.', sign: 'Taurus Ascendant', text: "The voice feature is magical — it's like having a wise astrologer right next to you." },
]

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CosmicBackground />

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px',
          background: 'rgba(124, 58, 237, 0.15)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '20px',
          marginBottom: '24px',
          fontSize: '0.8rem',
          color: 'var(--color-primary-light)',
          animation: 'fadeIn 0.6s ease-out',
        }}>
          <Star size={12} fill="currentColor" />
          AI-Powered Vedic Astrology · Completely Free
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: '700',
          lineHeight: '1.1',
          marginBottom: '24px',
          animation: 'fadeIn 0.7s ease-out',
        }}>
          <span style={{ color: 'white' }}>Unlock the Secrets</span>
          <br />
          <span className="gradient-text">Written in Your Stars</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--color-text-muted)',
          maxWidth: '560px',
          lineHeight: '1.7',
          marginBottom: '40px',
          animation: 'fadeIn 0.8s ease-out',
        }}>
          Your personal AI astrologer powered by Vedic wisdom. Get precise birth charts,
          deep planetary insights, and personalized cosmic guidance — all running locally on your device.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeIn 0.9s ease-out' }}>
          <Link to="/auth">
            <button className="btn-primary" id="hero-cta-primary" style={{ padding: '15px 36px', fontSize: '1rem' }}>
              <Star size={18} />
              Begin Your Journey
            </button>
          </Link>
          <Link to="/auth">
            <button className="btn-ghost" id="hero-cta-secondary" style={{ padding: '15px 28px', fontSize: '1rem' }}>
              View Sample Chart
            </button>
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', gap: '48px', marginTop: '72px',
          flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeIn 1s ease-out',
        }}>
          {[
            { num: '100%', label: 'Free Forever' },
            { num: 'Local AI', label: 'No Data Sent' },
            { num: 'Vedic', label: 'Sidereal System' },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '700', color: 'var(--color-accent)' }}>{num}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', marginBottom: '16px' }}>
            Everything You Need
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
            A complete astrology platform powered entirely by free, open-source technology.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: '28px', transition: 'all 0.3s', animation: `fadeIn ${0.3 + i * 0.1}s ease-out` }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = `${color}60`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
              }}
            >
              <div style={{
                width: '48px', height: '48px',
                background: `${color}20`,
                border: `1px solid ${color}40`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '10px', color: 'white' }}>{title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          What the Stars Reveal
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {TESTIMONIALS.map(({ name, sign, text }, i) => (
            <div key={i} className="card" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--color-text)', lineHeight: '1.7', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', marginBottom: '16px', fontStyle: 'italic' }}>
                "{text}"
              </p>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'white' }}>{name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sign}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '60px 24px 100px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '560px', margin: '0 auto',
          padding: '48px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.1))',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔮</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white', marginBottom: '12px' }}>
            Ready to Begin?
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>
            Your cosmic journey starts with your birth date. Sign up free and meet your AI astrologer.
          </p>
          <Link to="/auth">
            <button className="btn-primary" id="landing-bottom-cta" style={{ padding: '15px 40px', fontSize: '1rem' }}>
              <Sparkles size={18} />
              Start Free — No Credit Card
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

