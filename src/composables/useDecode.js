import { onMounted, onUnmounted, ref, unref } from 'vue'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function resolve(source) {
  const value = typeof source === 'function' ? source() : unref(source)
  return value == null ? '' : String(value)
}

export function useDecode(source, { duration = 1100, delay = 80 } = {}) {
  const text = ref(resolve(source))
  let timer = 0
  let started = 0
  let frame = 0
  let running = false

  function stop() {
    running = false
    window.clearTimeout(timer)
    cancelAnimationFrame(frame)
    timer = 0
    frame = 0
    started = 0
  }

  function tick(now) {
    if (!running) return
    const target = resolve(source)
    if (!started) started = now
    const elapsed = now - started
    const progress = Math.min(1, elapsed / duration)
    const revealed = Math.floor(progress * target.length)
    let next = ''

    for (let i = 0; i < target.length; i += 1) {
      if (i < revealed) {
        next += target[i]
      } else if (target[i] === ' ') {
        next += ' '
      } else {
        next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
    }

    text.value = next
    if (progress < 1) {
      frame = requestAnimationFrame(tick)
    } else {
      text.value = target
      running = false
    }
  }

  function play() {
    const target = resolve(source)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stop()
    if (!target || reduce) {
      text.value = target
      return
    }
    text.value = target.replace(/[^\s]/g, '·')
    running = true
    timer = window.setTimeout(() => {
      frame = requestAnimationFrame(tick)
    }, delay)
  }

  onMounted(play)
  onUnmounted(stop)

  return text
}
