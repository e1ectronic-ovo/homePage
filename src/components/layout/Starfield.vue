<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let frame = 0
let resize = () => {}
let nebula = null
let stars = []
let streaks = []
let angle = 0
let last = 0

function rand(a, b) {
  return a + Math.random() * (b - a)
}

function makeNebula(w, h) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const o = off.getContext('2d')
  const cx = w * 0.5
  const cy = h * 0.5
  const scale = Math.min(w, h)

  o.fillStyle = '#07090d'
  o.fillRect(0, 0, w, h)

  const halo = o.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.72)
  halo.addColorStop(0, 'rgba(18, 24, 32, 1)')
  halo.addColorStop(0.45, 'rgba(10, 13, 18, 0.9)')
  halo.addColorStop(1, 'rgba(7, 9, 13, 0)')
  o.fillStyle = halo
  o.fillRect(0, 0, w, h)

  o.globalCompositeOperation = 'lighter'
  const arms = 2
  const puffs = 1400
  for (let arm = 0; arm < arms; arm += 1) {
    for (let i = 0; i < puffs; i += 1) {
      const t = i / puffs
      const theta = t * Math.PI * 3.4 + arm * Math.PI + 0.35
      const r = (0.03 + t * 0.48) * scale
      const spread = (0.01 + t * 0.09) * scale
      const x = cx + Math.cos(theta) * r + (Math.random() - 0.5) * spread * 3.4
      const y = cy + Math.sin(theta) * r * 0.38 + (Math.random() - 0.5) * spread * 1.6
      const warm = Math.random() > 0.62
      const a = (1 - t) * (warm ? 0.045 : 0.07) * rand(0.4, 1)
      o.fillStyle = warm
        ? `rgba(196, 176, 142, ${a})`
        : `rgba(132, 168, 176, ${a})`
      o.beginPath()
      o.arc(x, y, spread * rand(0.25, 0.95), 0, Math.PI * 2)
      o.fill()
    }
  }

  const core = o.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.22)
  core.addColorStop(0, 'rgba(255, 244, 220, 0.28)')
  core.addColorStop(0.18, 'rgba(214, 196, 160, 0.16)')
  core.addColorStop(0.45, 'rgba(140, 176, 186, 0.08)')
  core.addColorStop(1, 'rgba(140, 176, 186, 0)')
  o.fillStyle = core
  o.beginPath()
  o.ellipse(cx, cy, scale * 0.22, scale * 0.09, 0.15, 0, Math.PI * 2)
  o.fill()
  o.globalCompositeOperation = 'source-over'
  return off
}

function makeStars(w, h, count) {
  const cx = w * 0.54
  const cy = h * 0.46
  const scale = Math.min(w, h)
  return Array.from({ length: count }, (_, i) => {
    const inArm = i < count * 0.55
    const t = Math.random()
    const arm = Math.floor(Math.random() * 2)
    const theta = t * Math.PI * 3.4 + arm * Math.PI + 0.35
    const r = (0.04 + t * 0.5) * scale
    const spread = (0.008 + t * 0.07) * scale
    return {
      bound: inArm,
      x: inArm ? cx + Math.cos(theta) * r + (Math.random() - 0.5) * spread * 2.2 : Math.random() * w,
      y: inArm ? cy + Math.sin(theta) * r * 0.38 + (Math.random() - 0.5) * spread : Math.random() * h,
      ox: 0,
      oy: 0,
      r: Math.random() ** 2 * 1.35 + 0.2,
      a: rand(0.12, 0.85),
      tw: Math.random() * Math.PI * 2,
      tws: rand(0.008, 0.02),
      drift: rand(-0.018, 0.018),
    }
  }).map((s) => {
    s.ox = s.x - cx
    s.oy = s.y - cy
    return s
  })
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d', { alpha: false })
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches

  resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const pad = 1.45
    nebula = makeNebula(Math.max(1, Math.floor(width * pad)), Math.max(1, Math.floor(height * pad)))
    const count = reduce ? 90 : coarse ? 160 : 280
    stars = makeStars(width, height, count)
    streaks = []
  }

  function spawnStreak(w, h) {
    if (streaks.length > 1) return
    const x = rand(w * 0.1, w * 0.9)
    const y = rand(h * 0.05, h * 0.45)
    const len = rand(80, 160)
    const dir = rand(-0.45, -0.2)
    streaks.push({
      x,
      y,
      vx: Math.cos(dir) * rand(7, 11),
      vy: Math.sin(dir) * rand(7, 11),
      len,
      life: 1,
    })
  }

  function draw(now) {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const cx = width * 0.54
    const cy = height * 0.46
    const dt = last ? Math.min(32, now - last) : 16
    last = now
    if (!reduce) angle += dt * 0.000018

    ctx.fillStyle = '#07090d'
    ctx.fillRect(0, 0, width, height)

    if (nebula) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.drawImage(nebula, -nebula.width / 2, -nebula.height / 2)
      ctx.restore()
    }

    for (const star of stars) {
      star.tw += star.tws
      const pulse = reduce ? 1 : 0.65 + Math.sin(star.tw) * 0.35
      let x
      let y
      if (star.bound) {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        x = cx + star.ox * cos - star.oy * sin
        y = cy + star.ox * sin + star.oy * cos
      } else {
        if (!reduce) star.x += star.drift
        if (star.x < 0) star.x = width
        if (star.x > width) star.x = 0
        x = star.x
        y = star.y
      }
      ctx.beginPath()
      ctx.fillStyle = `rgba(226, 232, 236, ${star.a * pulse})`
      ctx.arc(x, y, star.r, 0, Math.PI * 2)
      ctx.fill()
      if (star.r > 1.15) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(200, 216, 220, ${star.a * pulse * 0.18})`
        ctx.arc(x, y, star.r * 3.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (!reduce && Math.random() < 0.006) spawnStreak(width, height)
    ctx.strokeStyle = 'rgba(230, 236, 240, 0.7)'
    ctx.lineCap = 'round'
    for (let i = streaks.length - 1; i >= 0; i -= 1) {
      const s = streaks[i]
      s.x += s.vx
      s.y += s.vy
      s.life -= 0.028
      ctx.globalAlpha = Math.max(0, s.life)
      ctx.lineWidth = 1.1
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x - s.vx * 4.2, s.y - s.vy * 4.2)
      ctx.stroke()
      ctx.globalAlpha = 1
      if (s.life <= 0) streaks.splice(i, 1)
    }

    if (!reduce) frame = requestAnimationFrame(draw)
  }

  resize()
  draw(performance.now())
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvasRef" class="galaxy" aria-hidden="true" />
</template>

<style scoped>
.galaxy {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  z-index: 0;
}
</style>
