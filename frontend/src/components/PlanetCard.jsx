const PLANET_EMOJIS = {
  Sun: '☀️', Moon: '🌙', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆', Pluto: '♇',
}

const ELEMENT_BG = {
  Fire: 'rgba(249, 115, 22, 0.1)',
  Earth: 'rgba(34, 197, 94, 0.1)',
  Air: 'rgba(234, 179, 8, 0.1)',
  Water: 'rgba(59, 130, 246, 0.1)',
}

const ELEMENT_BORDER = {
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

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      padding: '14px 16px',
      transition: 'all 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 24px ${border}`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {planet.name}
          </span>
        </div>
        {planet.retrograde && (
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontWeight: '600',
            letterSpacing: '0.04em',
          }}>
            ℞ Retro
          </span>
        )}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px' }}>
        {planet.sign}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
        {planet.position.toFixed(1)}° · {planet.house}
      </div>
    </div>
  )
}
