import { useState } from 'react'

export default function LifeAreasChart({ areas }) {
  if (!areas || areas.length === 0) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Life area insights are not available for this chart.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Generate a new chart to see AI insights.</p>
      </div>
    )
  }

  const [activeIndex, setActiveIndex] = useState(0)
  const activeArea = areas[activeIndex] || areas[0]

  // Math for Radar Chart
  const svgSize = 340
  const cx = svgSize / 2
  const cy = svgSize / 2
  const maxR = 110 // Max radius for score 10
  const numPoints = areas.length

  const getPoint = (score, index) => {
    const angle = -Math.PI / 2 + (index * (2 * Math.PI)) / numPoints
    // scale score 0-10 to radius 0-maxR
    const r = (score / 10) * maxR
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    }
  }

  // Generate web rings (20%, 40%, 60%, 80%, 100%)
  const webRings = [2, 4, 6, 8, 10].map(level => {
    return areas.map((_, i) => getPoint(level, i))
  })

  // Generate actual data points
  const dataPoints = areas.map((area, i) => getPoint(area.score, i))
  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass" style={{ padding: '24px 10px', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
        <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', color: 'white', marginBottom: '10px' }}>
          Life Matrix
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="dataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(124,58,237,0.8)" />
                <stop offset="100%" stopColor="rgba(167,139,250,0.3)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Web Rings Background */}
            {webRings.map((ring, ringIdx) => (
              <polygon
                key={ringIdx}
                points={ring.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(124,58,237,0.15)"
                strokeWidth={ringIdx === webRings.length - 1 ? 1 : 0.5}
                strokeDasharray={ringIdx % 2 === 0 ? '4 4' : 'none'}
              />
            ))}

            {/* Axes Lines */}
            {areas.map((_, i) => {
              const p = getPoint(10, i)
              return (
                <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(124,58,237,0.2)" strokeWidth="1" />
              )
            })}

            {/* Data Polygon */}
            <polygon
              points={polygonPath}
              fill="url(#dataGrad)"
              stroke="#a855f7"
              strokeWidth="2"
              style={{ filter: 'url(#glow)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />

            {/* Data Nodes & Labels */}
            {areas.map((area, i) => {
              const nodePt = getPoint(area.score, i)
              const labelPt = getPoint(10, i)
              
              // Push labels slightly outwards
              const angle = -Math.PI / 2 + (i * (2 * Math.PI)) / numPoints
              const lx = cx + (maxR + 32) * Math.cos(angle)
              const ly = cy + (maxR + 25) * Math.sin(angle)
              
              const isActive = activeIndex === i

              return (
                <g 
                  key={i} 
                  onClick={() => setActiveIndex(i)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <circle
                    cx={nodePt.x}
                    cy={nodePt.y}
                    r={isActive ? 7 : 5}
                    fill={isActive ? '#f59e0b' : '#a855f7'}
                    stroke="rgba(20,12,40,0.9)"
                    strokeWidth="2"
                    style={{ filter: isActive ? 'drop-shadow(0 0 8px #f59e0b)' : 'none', transition: 'all 0.3s' }}
                  />
                  
                  {/* Label Group */}
                  <g transform={`translate(${lx}, ${ly})`} opacity={isActive ? 1 : 0.6} style={{ transition: 'opacity 0.3s' }}>
                    <rect 
                      x="-40" y="-12" width="80" height="24" 
                      rx="12" fill={isActive ? 'rgba(124,58,237,0.25)' : 'transparent'} 
                      stroke={isActive ? 'rgba(124,58,237,0.5)' : 'transparent'} 
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight={isActive ? 'bold' : 'normal'}
                      fill="white"
                      style={{ letterSpacing: '0.02em' }}
                    >
                      {area.emoji} {area.name.split(' & ')[0]}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '8px' }}>
          Select an area node to focus
        </p>
      </div>

      {/* Selected Area Details Card */}
      <div className="card" style={{ 
        padding: '24px', 
        animation: 'fadeIn 0.3s ease-out',
        border: '1px solid rgba(124,58,237,0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(167, 139, 250, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))' }}>{activeArea.emoji}</span> 
            {activeArea.name}
          </h3>
          <div style={{ 
            fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b', 
            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '6px 14px', borderRadius: '20px',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)'
          }}>
            {activeArea.score} / 10
          </div>
        </div>
        
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${Math.max(5, activeArea.score * 10)}%`, height: '100%', 
            background: 'linear-gradient(90deg, #7c3aed, #f59e0b)', 
            borderRadius: '2px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
        
        <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: '1.7', marginBottom: '16px' }}>
          <span style={{ color: 'var(--color-primary-light)', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
            Cosmic Insight
          </span>
          {activeArea.insight}
        </div>
        
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', lineHeight: '1.6', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', borderLeft: '4px solid #10b981' }}>
          <span style={{ color: '#34d399', fontWeight: 'bold', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            Guidance
          </span>
          {activeArea.advice}
        </div>
      </div>
    </div>
  )
}
