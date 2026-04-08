const ZODIAC_SIGNS = [
  '♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer',
  '♌ Leo', '♍ Virgo', '♎ Libra', '♏ Scorpio',
  '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces'
]

const SIGN_COLORS = {
  Aries: '#ef4444', Taurus: '#22c55e', Gemini: '#eab308', Cancer: '#a8a29e',
  Leo: '#f97316', Virgo: '#84cc16', Libra: '#ec4899', Scorpio: '#8b5cf6',
  Sagittarius: '#3b82f6', Capricorn: '#6b7280', Aquarius: '#06b6d4', Pisces: '#6366f1',
}

const ELEMENT_COLORS = {
  Fire: '#f97316', Earth: '#22c55e', Air: '#eab308', Water: '#3b82f6',
}

const SIGN_ELEMENT = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
}

export default function ZodiacWheel({ chart }) {
  if (!chart) return null

  const cx = 200
  const cy = 200
  const R = 170
  const innerR = 90
  const labelR = 135

  const planets = [
    { name: 'Sun', symbol: '☀', data: chart.sun },
    { name: 'Moon', symbol: '☽', data: chart.moon },
    { name: 'Mercury', symbol: '☿', data: chart.mercury },
    { name: 'Venus', symbol: '♀', data: chart.venus },
    { name: 'Mars', symbol: '♂', data: chart.mars },
    { name: 'Jupiter', symbol: '♃', data: chart.jupiter },
    { name: 'Saturn', symbol: '♄', data: chart.saturn },
  ]

  const degToRad = (deg) => ((deg - 90) * Math.PI) / 180

  const signSectors = ZODIAC_SIGNS.map((sign, i) => {
    const startAngle = (i * 30 - 90) * (Math.PI / 180)
    const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180)
    const midAngle = ((i * 30 + 15 - 90) * Math.PI) / 180

    const x1 = cx + R * Math.cos(startAngle)
    const y1 = cy + R * Math.sin(startAngle)
    const x2 = cx + R * Math.cos(endAngle)
    const y2 = cy + R * Math.sin(endAngle)
    const xi1 = cx + innerR * Math.cos(startAngle)
    const yi1 = cy + innerR * Math.sin(startAngle)
    const xi2 = cx + innerR * Math.cos(endAngle)
    const yi2 = cy + innerR * Math.sin(endAngle)

    const lx = cx + labelR * Math.cos(midAngle)
    const ly = cy + labelR * Math.sin(midAngle)

    const signName = sign.split(' ')[1]
    const element = SIGN_ELEMENT[signName]

    return { startAngle, endAngle, midAngle, x1, y1, x2, y2, xi1, yi1, xi2, yi2, lx, ly, sign, signName, element }
  })

  const planetPositions = planets.map(p => {
    if (!p.data) return null
    const absPos = p.data.abs_position
    const angle = degToRad(absPos)
    const r = innerR - 22
    return {
      ...p,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }).filter(Boolean)

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="400" height="400" viewBox="0 0 400 400" style={{ filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.3))' }}>
        {/* Background */}
        <circle cx={cx} cy={cy} r={R + 5} fill="rgba(10, 6, 18, 0.9)" />

        {/* Zodiac sectors */}
        {signSectors.map(({ startAngle, endAngle, x1, y1, x2, y2, xi1, yi1, xi2, yi2, lx, ly, sign, signName, element }, i) => (
          <g key={i}>
            <path
              d={`M ${xi1} ${yi1} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 0 0 ${xi1} ${yi1}`}
              fill={`${ELEMENT_COLORS[element]}15`}
              stroke={`${ELEMENT_COLORS[element]}40`}
              strokeWidth="0.5"
            />
            <text
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="11"
              fill={`${ELEMENT_COLORS[element]}cc`}
              style={{ fontFamily: 'serif' }}
            >
              {sign.split(' ')[0]}
            </text>
          </g>
        ))}

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(124,58,237,0.4)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerR} fill="rgba(17, 13, 30, 0.9)" stroke="rgba(124,58,237,0.3)" strokeWidth="1" />

        {/* Spoke lines */}
        {signSectors.map(({ xi1, yi1, x1, y1 }, i) => (
          <line key={i} x1={xi1} y1={yi1} x2={x1} y2={y1} stroke="rgba(124,58,237,0.2)" strokeWidth="0.5" />
        ))}

        {/* Ascendant line */}
        {chart.ascendant && (() => {
          const ascAngle = degToRad(chart.houses?.[0]?.position ?? 0)
          return (
            <line
              x1={cx} y1={cy}
              x2={cx + (R + 10) * Math.cos(ascAngle)}
              y2={cy + (R + 10) * Math.sin(ascAngle)}
              stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,3"
              opacity="0.8"
            />
          )
        })()}

        {/* Planet markers */}
        {planetPositions.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={12} fill="rgba(20,12,40,0.95)" stroke={SIGN_COLORS[p.data.sign] || '#7c3aed'} strokeWidth="1.5" />
            <text
              x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="10"
              fill={SIGN_COLORS[p.data.sign] || '#a78bfa'}
              style={{ fontFamily: 'serif' }}
            >
              {p.symbol}
            </text>
          </g>
        ))}

        {/* Center */}
        <circle cx={cx} cy={cy} r={20} fill="rgba(124,58,237,0.2)" stroke="rgba(124,58,237,0.5)" strokeWidth="1" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#a78bfa" style={{ fontFamily: 'serif' }}>☸</text>
      </svg>
    </div>
  )
}
