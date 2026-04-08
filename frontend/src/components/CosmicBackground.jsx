import { useEffect, useRef } from 'react'

export default function CosmicBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let stars = []
    let shootingStars = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.012 + 0.004,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: Math.random() > 0.85
          ? `hsl(${260 + Math.random() * 60}, 80%, 80%)`
          : `hsl(240, 10%, ${75 + Math.random() * 25}%)`,
      }))
    }

    function spawnShootingStar() {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.4,
        len: Math.random() * 140 + 60,
        speed: Math.random() * 8 + 6,
        alpha: 1,
        angle: Math.PI / 5 + Math.random() * 0.3,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Stars
      for (const star of stars) {
        star.alpha += star.twinkleSpeed * star.twinkleDir
        if (star.alpha >= 1) { star.alpha = 1; star.twinkleDir = -1 }
        if (star.alpha <= 0.1) { star.alpha = 0.1; star.twinkleDir = 1 }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = star.alpha
        ctx.fill()
      }

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        ctx.globalAlpha = s.alpha
        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        )
        grad.addColorStop(0, 'rgba(200, 160, 255, 1)')
        grad.addColorStop(1, 'rgba(200, 160, 255, 0)')
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()

        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed
        s.alpha -= 0.025

        if (s.alpha <= 0) shootingStars.splice(i, 1)
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(draw)
    }

    // Nebula overlay
    const drawNebula = () => {
      const grd = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.3, 0,
        canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.5
      )
      grd.addColorStop(0, 'rgba(88, 28, 135, 0.08)')
      grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const grd2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.7, 0,
        canvas.width * 0.8, canvas.height * 0.7, canvas.width * 0.4
      )
      grd2.addColorStop(0, 'rgba(59, 7, 100, 0.07)')
      grd2.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grd2
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    // Shooting star interval
    const shootInterval = setInterval(spawnShootingStar, 3500)

    // Custom draw loop that includes nebula
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawNebula()

      for (const star of stars) {
        star.alpha += star.twinkleSpeed * star.twinkleDir
        if (star.alpha >= 1) { star.alpha = 1; star.twinkleDir = -1 }
        if (star.alpha <= 0.1) { star.alpha = 0.1; star.twinkleDir = 1 }
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = star.alpha
        ctx.fill()
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        ctx.globalAlpha = s.alpha
        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - Math.cos(s.angle) * s.len,
          s.y - Math.sin(s.angle) * s.len
        )
        grad.addColorStop(0, 'rgba(200, 160, 255, 1)')
        grad.addColorStop(1, 'rgba(200, 160, 255, 0)')
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed
        s.alpha -= 0.025
        if (s.alpha <= 0) shootingStars.splice(i, 1)
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(shootInterval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
