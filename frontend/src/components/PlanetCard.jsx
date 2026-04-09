const PLANET_EMOJIS = {
  Sun: '☀️', Moon: '🌙', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆', Pluto: '♇',
}

const ELEMENT_BG = {
  Fire: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))',
  Earth: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
  Air: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))',
  Water: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
}

const ELEMENT_BORDER = {
  Fire: 'rgba(249, 115, 22, 0.4)',
  Earth: 'rgba(34, 197, 94, 0.4)',
  Air: 'rgba(234, 179, 8, 0.4)',
  Water: 'rgba(59, 130, 246, 0.4)',
}

const ELEMENT_GLOW = {
  Fire: 'rgba(249, 115, 22, 0.3)',
  Earth: 'rgba(34, 197, 94, 0.3)',
  Air: 'rgba(234, 179, 8, 0.3)',
  Water: 'rgba(59, 130, 246, 0.3)',
}

const SIGN_ELEMENT = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
}

export default function PlanetCard({ planet }) {
  if (!planet) return null

  const emoji = PLANET_EMOJIS[planet.name] || '✦'
  const element = SIGN_ELEMENT[planet.sign] || 'Fire'
  const bg = ELEMENT_BG[element]
  const border = ELEMENT_BORDER[element]
  const glow = ELEMENT_GLOW[element]

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '16px',
      padding: '16px',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      backdropFilter: 'blur(8px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
        e.currentTarget.style.boxShadow = `0 12px 30px -10px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
        e.currentTarget.style.borderColor = glow
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)'
        e.currentTarget.style.borderColor = border
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem', filter: `drop-shadow(0 0 8px ${glow})` }}>{emoji}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {planet.name}
          </span>
        </div>
        {planet.retrograde && (
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontWeight: '700',
            letterSpacing: '0.05em',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)'
          }}>
            ℞ RETRO
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px', letterSpacing: '0.02em' }}>
        {planet.sign}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
        <span>{planet.position.toFixed(1)}°</span>
        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>House {planet.house}</span>
      </div>
    </div>
  )
}
