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

  // Group planets that are close to each other
  const sortedPlanets = [...planets]
    .filter(p => p.data)
    .sort((a, b) => a.data.abs_position - b.data.abs_position)

  const planetPositions = []
  if (sortedPlanets.length > 0) {
    let currentGroup = [sortedPlanets[0]]
    for (let i = 1; i < sortedPlanets.length; i++) {
        if (sortedPlanets[i].data.abs_position - currentGroup[currentGroup.length - 1].data.abs_position < 10) {
            currentGroup.push(sortedPlanets[i])
        } else {
            planetPositions.push(currentGroup)
            currentGroup = [sortedPlanets[i]]
        }
    }
    planetPositions.push(currentGroup)
  }

  // Calculate final positions with stagger
  const finalPlanetPositions = planetPositions.flatMap(group => {
      const isMultiple = group.length > 1;
      return group.map((p, i) => {
        const baseAbsPos = p.data.abs_position;
        // stagger them slightly if clumped
        const adjustedPos = isMultiple ? baseAbsPos + (i - (group.length-1)/2)*8 : baseAbsPos;
        const angle = degToRad(adjustedPos);
        const r = innerR - 26 + (i%2)*8; // stagger radially too
        return {
            ...p,
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
        }
      })
  })


  return (
    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
      <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: -1,
          animation: 'pulse-glow 4s ease-in-out infinite'
      }} />
      <svg width="400" height="400" viewBox="0 0 400 400" style={{ filter: 'drop-shadow(0 0 15px rgba(124,58,237,0.4))' }}>
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,0.4)" />
            <stop offset="100%" stopColor="rgba(12, 6, 28, 0.9)" />
          </radialGradient>
        </defs>

        {/* Outer space background */}
        <circle cx={cx} cy={cy} r={R + 8} fill="rgba(6, 3, 12, 0.95)" stroke="rgba(124,58,237,0.2)" strokeWidth="1" />
        
        {/* Zodiac ring */}
        <g className="zodiac-ring" style={{ transformOrigin: '200px 200px', animation: 'spin-slow 120s linear infinite' }}>
            {/* Zodiac sectors */}
            {signSectors.map(({ xi1, yi1, x1, y1, x2, y2, xi2, yi2, lx, ly, sign, element }, i) => (
            <g key={i}>
                <path
                d={`M ${xi1} ${yi1} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 0 0 ${xi1} ${yi1}`}
                fill={`${ELEMENT_COLORS[element]}11`}
                stroke={`${ELEMENT_COLORS[element]}60`}
                strokeWidth="0.8"
                style={{ transition: 'fill 0.3s' }}
                onMouseEnter={e => e.currentTarget.setAttribute('fill', `${ELEMENT_COLORS[element]}25`)}
                onMouseLeave={e => e.currentTarget.setAttribute('fill', `${ELEMENT_COLORS[element]}11`)}
                />
                <text
                x={lx} y={ly}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="12"
                fill={`${ELEMENT_COLORS[element]}ff`}
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textShadow: `0 0 8px ${ELEMENT_COLORS[element]}` }}
                >
                {sign.split(' ')[0]}
                </text>
            </g>
            ))}

            {/* Inner ring background */}
            <circle cx={cx} cy={cy} r={innerR} fill="url(#centerGlow)" stroke="rgba(124,58,237,0.5)" strokeWidth="1.5" />

            {/* Spoke lines */}
            {signSectors.map(({ xi1, yi1, x1, y1 }, i) => (
            <line key={i} x1={xi1} y1={yi1} x2={x1} y2={y1} stroke="rgba(124,58,237,0.25)" strokeWidth="0.8" />
            ))}

            {/* Ascendant line */}
            {chart.ascendant && (() => {
            const ascAngle = degToRad(chart.houses?.[0]?.position ?? 0)
            return (
                <g>
                   <line
                    x1={cx} y1={cy}
                    x2={cx + (R + 15) * Math.cos(ascAngle)}
                    y2={cy + (R + 15) * Math.sin(ascAngle)}
                    stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3,4"
                    opacity="0.9"
                    />
                    <circle cx={cx + (R + 15) * Math.cos(ascAngle)} cy={cy + (R + 15) * Math.sin(ascAngle)} r="4" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }} />
                </g>
            )
            })()}

            {/* Planet markers */}
            {finalPlanetPositions.map((p, i) => (
            <g key={i} style={{ transition: 'transform 0.4s ease-out' }}>
                <circle cx={p.x} cy={p.y} r={14} fill="rgba(10,5,20,0.9)" stroke={SIGN_COLORS[p.data.sign] || '#7c3aed'} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 6px ${SIGN_COLORS[p.data.sign] || '#7c3aed'})` }} />
                <text
                x={p.x} y={p.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11"
                fill="#ffffff"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 'bold' }}
                >
                {p.symbol}
                </text>
            </g>
            ))}
        </g>

        {/* Center fixed elements */}
        <circle cx={cx} cy={cy} r={24} fill="rgba(10, 6, 25, 0.95)" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 10px rgba(124,58,237,0.5))' }} />
        <circle cx={cx} cy={cy} r={18} fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#c084fc" style={{ filter: 'drop-shadow(0 0 5px #c084fc)' }}>☸</text>
      </svg>
    </div>
  )
}
