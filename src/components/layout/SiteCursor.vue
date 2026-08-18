<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const enabled = ref(false)
const visible = ref(false)
const active = ref(false)
const clicking = ref(false)
const textMode = ref(false)

const x = ref(-100)
const y = ref(-100)
const ringX = ref(-100)
const ringY = ref(-100)
const trailX = ref(-100)
const trailY = ref(-100)

let raf = 0
const interactive =
  'a, button, [role="button"], input, textarea, select, label, summary, .gate, .tab, .list-row, .cell, .swatch, .num-btn, .nav-link, .ctrl, .btn, .row, .back, .ext'

function canUseCustomCursor() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function onMove(e) {
  x.value = e.clientX
  y.value = e.clientY
  if (!visible.value) visible.value = true
}

function onOver(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  textMode.value = !!t.closest('input, textarea, [contenteditable="true"], .cm-content, .md-editor')
  active.value = !textMode.value && !!t.closest(interactive)
}

function onDown() {
  clicking.value = true
}
function onUp() {
  clicking.value = false
}
function onLeave() {
  visible.value = false
}

function tick() {
  ringX.value += (x.value - ringX.value) * 0.16
  ringY.value += (y.value - ringY.value) * 0.16
  trailX.value += (x.value - trailX.value) * 0.08
  trailY.value += (y.value - trailY.value) * 0.08
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!canUseCustomCursor()) return

  enabled.value = true
  document.documentElement.classList.add('has-custom-cursor')

  window.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseover', onOver, { passive: true })
  window.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup', onUp)
  document.documentElement.addEventListener('mouseleave', onLeave)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) raf = requestAnimationFrame(tick)
  else {
    const sync = () => {
      ringX.value = x.value
      ringY.value = y.value
      trailX.value = x.value
      trailY.value = y.value
      raf = requestAnimationFrame(sync)
    }
    raf = requestAnimationFrame(sync)
  }
})

onUnmounted(() => {
  document.documentElement.classList.remove('has-custom-cursor')
  window.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseover', onOver)
  window.removeEventListener('mousedown', onDown)
  window.removeEventListener('mouseup', onUp)
  document.documentElement.removeEventListener('mouseleave', onLeave)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="enabled"
      class="site-cursor"
      :class="{
        'is-visible': visible,
        'is-active': active,
        'is-clicking': clicking,
        'is-text': textMode,
      }"
      aria-hidden="true"
    >
      <div
        class="cursor-trail"
        :style="{ transform: `translate3d(${trailX}px, ${trailY}px, 0)` }"
      >
        <div class="trail-ring" />
        <div class="trail-scan" />
      </div>

      <div
        class="cursor-frame"
        :style="{ transform: `translate3d(${ringX}px, ${ringY}px, 0)` }"
      >
        <div class="frame-box">
          <span class="frame-corner frame-tl" />
          <span class="frame-corner frame-tr" />
          <span class="frame-corner frame-bl" />
          <span class="frame-corner frame-br" />
        </div>
        <span class="frame-tag" />
      </div>

      <div
        class="cursor-core"
        :style="{ transform: `translate3d(${x}px, ${y}px, 0)` }"
      >
        <span class="core-glow" />
        <span class="core-line core-line-h" />
        <span class="core-line core-line-v" />
        <span class="core-node" />
        <span class="core-ripple" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.site-cursor {
  --c-cyan: #00e8ff;
  --c-mag: #ff3ecf;
  --c-cyan-dim: rgba(0, 232, 255, 0.28);
  --c-lock: #ff6bf0;
  --c-lock-glow: rgba(255, 107, 240, 0.55);
  --ring: 34px;
  --frame: 24px;
  --frame-active: 32px;

  position: fixed;
  inset: 0;
  z-index: 100000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s var(--ease);
  mix-blend-mode: screen;
}

.site-cursor.is-visible {
  opacity: 1;
}

.cursor-trail,
.cursor-frame,
.cursor-core {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  will-change: transform;
}

/* 所有图层以鼠标点为中心对齐 */
.trail-ring,
.trail-scan,
.frame-box,
.core-glow,
.core-line,
.core-node,
.core-ripple {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
}

/* ── 扫描环 ── */
.trail-ring {
  width: var(--ring);
  height: var(--ring);
  border-radius: 50%;
  border: 1px solid var(--c-cyan-dim);
  box-shadow: 0 0 10px rgba(0, 232, 255, 0.06);
  transition: width 0.32s var(--ease), height 0.32s var(--ease), border-color 0.32s var(--ease);
}

.trail-scan {
  width: var(--ring);
  height: var(--ring);
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(0, 232, 255, 0.65) 22deg,
    transparent 44deg
  );
  mask: radial-gradient(circle, transparent 58%, #000 59%, #000 74%, transparent 75%);
  -webkit-mask: radial-gradient(circle, transparent 58%, #000 59%, #000 74%, transparent 75%);
  animation: scan-spin 2.2s linear infinite;
  transition: width 0.32s var(--ease), height 0.32s var(--ease), animation-duration 0.3s var(--ease);
}

/* ── 角括号（严格居中对称） ── */
.frame-box {
  width: var(--frame);
  height: var(--frame);
  transition: width 0.3s var(--ease), height 0.3s var(--ease);
}

.frame-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  transition: width 0.3s var(--ease), height 0.3s var(--ease), border-color 0.3s var(--ease);
}

.frame-tl {
  top: 0;
  left: 0;
  border-top: 1px solid var(--c-cyan);
  border-left: 1px solid var(--c-cyan);
  box-shadow: -1px -1px 5px rgba(0, 232, 255, 0.35);
}

.frame-tr {
  top: 0;
  right: 0;
  border-top: 1px solid var(--c-cyan);
  border-right: 1px solid var(--c-cyan);
  box-shadow: 1px -1px 5px rgba(0, 232, 255, 0.35);
}

.frame-bl {
  bottom: 0;
  left: 0;
  border-bottom: 1px solid var(--c-cyan);
  border-left: 1px solid var(--c-cyan);
  box-shadow: -1px 1px 5px rgba(0, 232, 255, 0.35);
}

.frame-br {
  bottom: 0;
  right: 0;
  border-bottom: 1px solid var(--c-cyan);
  border-right: 1px solid var(--c-cyan);
  box-shadow: 1px 1px 5px rgba(0, 232, 255, 0.35);
}

.frame-tag {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, calc(var(--frame) / 2 + 8px));
  font-family: var(--font-mono);
  font-size: 5.5px;
  letter-spacing: 0.2em;
  color: var(--c-cyan);
  opacity: 0.3;
  text-shadow: 0 0 6px rgba(0, 232, 255, 0.45);
  transition: opacity 0.25s var(--ease), color 0.25s var(--ease), transform 0.3s var(--ease);
  white-space: nowrap;
}

.frame-tag::after {
  content: 'TRK';
}

/* ── 中心准星 ── */
.core-glow {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 232, 255, 0.35) 0%, transparent 72%);
  opacity: 0.5;
  transition: opacity 0.25s var(--ease);
}

.core-line {
  transition: all 0.22s var(--ease);
}

.core-line-h {
  width: 14px;
  height: 1px;
  background: var(--c-cyan);
  box-shadow: 0 0 5px rgba(0, 232, 255, 0.55);
  opacity: 0.85;
}

.core-line-v {
  width: 1px;
  height: 14px;
  background: var(--c-mag);
  box-shadow: 0 0 5px rgba(255, 62, 207, 0.45);
  opacity: 0.75;
}

.core-node {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 4px #fff,
    0 0 8px rgba(0, 232, 255, 0.5);
  transition: all 0.22s var(--ease);
}

.core-ripple {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: 1px solid var(--c-cyan);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

/* ── 锁定 ── */
.site-cursor.is-active {
  --ring: 42px;
  --frame: var(--frame-active);
}

.site-cursor.is-active .trail-ring {
  border-color: rgba(255, 107, 240, 0.4);
  box-shadow: 0 0 14px rgba(255, 107, 240, 0.1);
}

.site-cursor.is-active .trail-scan {
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    var(--c-lock-glow) 30deg,
    transparent 60deg
  );
  animation-duration: 0.75s;
}

.site-cursor.is-active .frame-corner {
  width: 10px;
  height: 10px;
  border-color: var(--c-lock);
  box-shadow: 0 0 6px var(--c-lock-glow);
}

.site-cursor.is-active .frame-tag {
  opacity: 0.88;
  color: var(--c-lock);
  text-shadow: 0 0 6px var(--c-lock-glow);
}

.site-cursor.is-active .frame-tag::after {
  content: 'ACQ';
}

.site-cursor.is-active .core-line-h,
.site-cursor.is-active .core-line-v {
  background: var(--c-lock);
  box-shadow: 0 0 7px var(--c-lock-glow);
  opacity: 0.95;
}

.site-cursor.is-active .core-glow {
  opacity: 0.75;
  background: radial-gradient(circle, var(--c-lock-glow) 0%, transparent 72%);
}

/* ── 点击 ── */
.site-cursor.is-clicking .core-ripple {
  animation: core-burst 0.38s var(--ease) forwards;
}

.site-cursor.is-clicking .core-node {
  transform: translate(-50%, -50%) scale(0.5);
}

.site-cursor.is-clicking .trail-ring {
  border-color: var(--c-cyan);
  box-shadow: 0 0 16px rgba(0, 232, 255, 0.18);
}

/* ── 文本 ── */
.site-cursor.is-text .cursor-trail,
.site-cursor.is-text .cursor-frame {
  opacity: 0;
}

.site-cursor.is-text .core-line-h,
.site-cursor.is-text .core-glow,
.site-cursor.is-text .core-ripple {
  opacity: 0;
}

.site-cursor.is-text .core-line-v {
  width: 1.5px;
  height: 14px;
  opacity: 1;
  background: linear-gradient(
    180deg,
    transparent,
    var(--c-cyan) 18%,
    #fff 50%,
    var(--c-mag) 82%,
    transparent
  );
  box-shadow: 0 0 8px rgba(0, 232, 255, 0.4);
  animation: beam-flicker 2s ease-in-out infinite;
}

.site-cursor.is-text .core-node {
  width: 1.5px;
  height: 1.5px;
  border-radius: 0;
}

@keyframes scan-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes core-burst {
  0% {
    opacity: 0.85;
    transform: translate(-50%, -50%) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(3.5);
  }
}

@keyframes beam-flicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
  53% { opacity: 0.55; }
  56% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .trail-scan {
    animation: none;
    opacity: 0.35;
  }

  .site-cursor.is-text .core-line-v {
    animation: none;
  }
}
</style>
