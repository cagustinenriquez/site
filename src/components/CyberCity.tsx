import { useEffect, useRef } from 'react'

// Animated neon city behind the front page: a dusk sky with a striped sun, three skyline
// layers that rise at different speeds as you scroll (parallax), blinking antenna lights,
// flying cars and rain. The skylines are drawn once per screen size; each frame only
// composites them, so it stays cheap. It runs at 30 fps and pauses when the tab is hidden.

type Layer = {
  img: HTMLCanvasElement
  top: number // where the layer's top sits in the viewport before scrolling (CSS px)
  rise: number // how far it moves up over the whole page scroll, as a share of the viewport height
  lights: { x: number; y: number; ph: number }[]
}

const NEON = ['#2de2e6', '#ff2e88', '#ffb000', '#7a3cff']
const SIGNS = ['API', 'PY', 'AWS', '404', 'ROOT', 'SYS', 'NET', '0xFF', 'λ', 'SUDO']

function rng(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function buildLayer(w: number, h: number, dpr: number, depth: number): Layer {
  const rn = rng(7 + depth * 101)
  const top = h * [0.42, 0.5, 0.62][depth]
  const rise = [0.12, 0.3, 0.55][depth]
  // Tall enough to keep covering the bottom of the screen after rising
  const lh = h - top + h * rise + 40
  const img = document.createElement('canvas')
  img.width = Math.ceil(w * dpr)
  img.height = Math.ceil(lh * dpr)
  const c = img.getContext('2d')!
  c.scale(dpr, dpr)
  const body = ['#1c1236', '#120c26', '#08061a'][depth]
  const edge = ['#2c1f52', '#251a48', '#1a1338'][depth]
  const lights: Layer['lights'] = []
  let x = -10
  while (x < w + 10) {
    const bw = (18 + rn() * 46) * (1 + depth * 0.45)
    // Tower tops land between 4% and 30% of the screen height below the layer's top line
    const by = h * 0.3 - h * (0.02 + rn() * 0.26)
    c.fillStyle = body
    c.fillRect(x, by, bw, lh - by)
    c.fillStyle = edge
    c.fillRect(x, by, bw, 2)
    // Stepped crowns on some towers
    if (rn() < 0.35) {
      c.fillStyle = body
      c.fillRect(x + bw * 0.2, by - 10, bw * 0.6, 10)
      c.fillStyle = edge
      c.fillRect(x + bw * 0.2, by - 10, bw * 0.6, 1)
    }
    // Antenna with a blinking light (drawn per frame)
    if (rn() < 0.3) {
      const ax = x + bw * (0.3 + rn() * 0.4)
      const ah = 12 + rn() * 26
      c.fillStyle = edge
      c.fillRect(ax, by - ah, 1.5, ah)
      lights.push({ x: ax + 0.75, y: by - ah, ph: rn() * 6 })
    }
    // Windows
    const gx = depth === 2 ? 7 : 5
    const gy = depth === 2 ? 9 : 7
    for (let wy = by + 8; wy < lh - 4; wy += gy) {
      for (let wx = x + 4; wx < x + bw - 4; wx += gx) {
        if (rn() > [0.16, 0.13, 0.1][depth]) continue
        const col = rn() < 0.7 ? (rn() < 0.6 ? '#2de2e6' : '#ff2e88') : '#ffb000'
        c.globalAlpha = 0.35 + rn() * 0.5
        c.fillStyle = col
        c.fillRect(wx, wy, depth === 2 ? 3 : 2, depth === 2 ? 3 : 2)
      }
    }
    c.globalAlpha = 1
    // Neon signs on the closer layers
    if (depth > 0 && rn() < 0.33 && bw > 30) {
      const text = SIGNS[Math.floor(rn() * SIGNS.length)]
      const col = NEON[Math.floor(rn() * 3)]
      const size = depth === 2 ? 15 : 11
      const sx = x + bw / 2
      const sy = by + 18 + rn() * 30
      c.font = `700 ${size}px 'IBM Plex Mono', monospace`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      const tw = c.measureText(text).width + 10
      c.strokeStyle = col
      c.lineWidth = 1.5
      c.shadowColor = col
      c.shadowBlur = 12
      c.strokeRect(sx - tw / 2, sy - size * 0.8, tw, size * 1.6)
      c.fillStyle = col
      c.fillText(text, sx, sy + 1)
      c.shadowBlur = 0
    }
    x += bw + rn() * 6 * (depth + 1)
  }
  return { img, top, rise, lights }
}

// calm: lighter rain and a darker overlay, for pages with long text to read
export function CyberCity({ calm = false }: { calm?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dpr = 1
    let layers: Layer[] = []
    let stars: { x: number; y: number; r: number; ph: number }[] = []
    let rain: { x: number; y: number; s: number; l: number }[] = []
    const cars = [0, 1, 2].map((i) => ({ x: Math.random(), y: 0.2 + i * 0.12, v: (i % 2 ? -1 : 1) * (0.0008 + i * 0.0003) }))

    function setup() {
      // Phones resize the viewport when the address bar hides; only rebuild on real changes
      const nw = window.innerWidth
      const nh = window.innerHeight
      if (nw === w && Math.abs(nh - h) < 120 && layers.length) return
      w = nw
      h = nh
      dpr = Math.min(window.devicePixelRatio || 1, 1.25)
      cv!.width = Math.ceil(w * dpr)
      cv!.height = Math.ceil(h * dpr)
      layers = [0, 1, 2].map((d) => buildLayer(w, h, dpr, d))
      const rn = rng(3)
      stars = [...Array(Math.round((w * h) / 9000))].map(() => ({ x: rn() * w, y: rn() * h * 0.55, r: rn() < 0.1 ? 1.4 : 0.8, ph: rn() * 6 }))
      rain = [...Array(reduced ? 0 : Math.round((w * h) / (calm ? 20000 : 7000)))].map(() => ({ x: rn() * w, y: rn() * h, s: 9 + rn() * 7, l: 8 + rn() * 12 }))
    }

    function draw(t: number) {
      const c = ctx!
      const max = Math.max(1, document.documentElement.scrollHeight - h)
      const p = Math.min(1, window.scrollY / max)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Sky: magenta dusk at the top of the page, deep night by the bottom
      const sky = c.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#05040d')
      sky.addColorStop(0.45, p < 0.5 ? '#170a2e' : '#0d0820')
      sky.addColorStop(0.75, `rgba(${Math.round(120 - p * 80)}, 20, ${Math.round(90 - p * 30)}, 1)`)
      sky.addColorStop(1, '#2a0d3a')
      c.fillStyle = sky
      c.fillRect(0, 0, w, h)

      for (const s of stars) {
        c.globalAlpha = 0.35 + 0.35 * Math.sin(t / 900 + s.ph)
        c.fillStyle = '#e8f6ff'
        c.fillRect(s.x, s.y - p * h * 0.05, s.r, s.r)
      }
      c.globalAlpha = 1

      // Striped retro sun that sinks as you scroll
      const sunR = Math.min(w, h) * 0.2
      const sunX = w * 0.68
      const sunY = h * 0.5 + p * h * 0.35
      const sg = c.createLinearGradient(0, sunY - sunR, 0, sunY + sunR)
      sg.addColorStop(0, '#ffe066')
      sg.addColorStop(0.55, '#ff6a5a')
      sg.addColorStop(1, '#ff2e88')
      c.save()
      c.shadowColor = '#ff2e88'
      c.shadowBlur = 60
      c.fillStyle = sg
      c.beginPath()
      c.arc(sunX, sunY, sunR, 0, Math.PI * 2)
      c.fill()
      c.restore()
      c.fillStyle = '#1a0b2e'
      for (let i = 0; i < 7; i++) {
        const yy = sunY + sunR * 0.1 + i * sunR * 0.13
        c.fillRect(sunX - sunR, yy, sunR * 2, 1.5 + i * 1.3)
      }

      // Flying cars between the sky and the skyline
      for (const car of cars) {
        if (!reduced) car.x = (car.x + car.v + 1.2) % 1.2
        const cx = (car.x - 0.1) * w
        const cy = car.y * h + h * 0.15 - p * h * 0.2
        const dir = Math.sign(car.v)
        const trail = c.createLinearGradient(cx, 0, cx - dir * 50, 0)
        trail.addColorStop(0, 'rgba(255,46,136,.8)')
        trail.addColorStop(1, 'rgba(255,46,136,0)')
        c.fillStyle = trail
        c.fillRect(Math.min(cx, cx - dir * 50), cy, 50, 1.5)
        c.fillStyle = '#e8f6ff'
        c.fillRect(cx - 2, cy - 1, 4, 3)
      }

      // Skyline layers with haze between them
      layers.forEach((L, i) => {
        const y = L.top - p * h * L.rise
        c.drawImage(L.img, 0, 0, L.img.width, L.img.height, 0, y, w, L.img.height / dpr)
        for (const a of L.lights) {
          if (Math.sin(t / 500 + a.ph) < 0.3) continue
          c.fillStyle = '#ff3355'
          c.fillRect(a.x - 1.5, y + a.y - 1.5, 3, 3)
        }
        if (i < 2) {
          const hz = c.createLinearGradient(0, y + h * 0.05, 0, y + h * 0.4)
          hz.addColorStop(0, 'rgba(255,46,136,0)')
          hz.addColorStop(1, `rgba(${i ? '20,8,40' : '90,20,90'},${i ? 0.55 : 0.35})`)
          c.fillStyle = hz
          c.fillRect(0, y + h * 0.05, w, h * 0.35)
        }
      })

      // Rain
      if (rain.length) {
        c.strokeStyle = 'rgba(160,220,255,.22)'
        c.lineWidth = 1
        c.beginPath()
        for (const d of rain) {
          d.y += d.s * 0.5
          d.x -= d.s * 0.12
          if (d.y > h) {
            d.y = -d.l
            d.x = Math.random() * (w + 60)
          }
          c.moveTo(d.x, d.y)
          c.lineTo(d.x - d.l * 0.25, d.y + d.l)
        }
        c.stroke()
      }

      // Darken toward the bottom so text panels stay readable
      const vg = c.createLinearGradient(0, 0, 0, h)
      vg.addColorStop(0, calm ? 'rgba(5,4,13,.35)' : 'rgba(5,4,13,.15)')
      vg.addColorStop(1, calm ? 'rgba(5,4,13,.7)' : 'rgba(5,4,13,.55)')
      c.fillStyle = vg
      c.fillRect(0, 0, w, h)
    }

    setup()
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < 33) return // ~30 fps is plenty for a background
      last = t
      draw(t)
    }
    const onResize = () => {
      setup()
      draw(performance.now())
    }
    const onScroll = () => draw(performance.now())
    window.addEventListener('resize', onResize)
    if (reduced) {
      // No animation: redraw only when the page scrolls
      window.addEventListener('scroll', onScroll, { passive: true })
      draw(0)
    } else {
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [calm])

  return <canvas ref={ref} className="cyber-city" aria-hidden="true" />
}
