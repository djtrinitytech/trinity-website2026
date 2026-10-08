'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  rotation: number
  spin: number
  hue: number
}

const MAX_PARTICLES = 220

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const inner = size * 0.22
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? size : inner
    const angle = (i * Math.PI) / 4
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  ctx.closePath()
  ctx.fill()
}

export function CursorSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const particles: Particle[] = []
    let frame = 0
    let lastX = -1
    let lastY = -1

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.globalCompositeOperation = 'lighter'

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.035
        p.vx *= 0.98
        p.rotation += p.spin

        const progress = p.life / p.maxLife
        const alpha = progress < 0.15 ? progress / 0.15 : 1 - (progress - 0.15) / 0.85
        const twinkle = 0.7 + Math.sin(p.life * 0.6) * 0.3
        const size = p.size * (1 - progress * 0.5)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = Math.max(alpha * twinkle, 0)
        ctx.shadowBlur = 12
        ctx.shadowColor = `hsla(${p.hue}, 85%, 60%, 0.9)`
        ctx.fillStyle = `hsl(${p.hue}, 90%, ${72 + Math.random() * 14}%)`
        drawStar(ctx, size)
        ctx.restore()
      }

      frame = particles.length > 0 ? requestAnimationFrame(tick) : 0
    }

    const spawn = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift()
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 1.2 + 0.2
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          life: 0,
          maxLife: 40 + Math.random() * 40,
          size: Math.random() * 4 + 2,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.12,
          hue: 32 + Math.random() * 18,
        })
      }
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const distance = lastX < 0 ? 0 : Math.hypot(e.clientX - lastX, e.clientY - lastY)
      lastX = e.clientX
      lastY = e.clientY
      spawn(e.clientX, e.clientY, Math.min(1 + Math.floor(distance / 12), 5))
    }

    const onDown = (e: PointerEvent) => spawn(e.clientX, e.clientY, 18)

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] h-full w-full" />
}
