<script setup>
import { computed, onUnmounted, ref } from 'vue'

const running = ref(false)
const phase = ref('idle') // idle | inhale | exhale
let timer = 0

const INHALE_MS = 4000
const EXHALE_MS = 6000
const DOTS = [0, 1, 2]

const phaseCode = computed(() => {
  if (phase.value === 'inhale') return 'IN'
  if (phase.value === 'exhale') return 'OUT'
  return '—'
})

const labelBase = computed(() => {
  if (phase.value === 'inhale') return '吸气'
  if (phase.value === 'exhale') return '慢慢呼气'
  return '点一下，开始'
})

const showDots = computed(() => phase.value === 'inhale' || phase.value === 'exhale')

function clear() {
  window.clearTimeout(timer)
  timer = 0
}

function tickInhale() {
  phase.value = 'inhale'
  timer = window.setTimeout(tickExhale, INHALE_MS)
}

function tickExhale() {
  phase.value = 'exhale'
  timer = window.setTimeout(() => {
    if (!running.value) return
    tickInhale()
  }, EXHALE_MS)
}

function start() {
  running.value = true
  tickInhale()
}

function stop() {
  running.value = false
  clear()
  phase.value = 'idle'
}

function toggle() {
  if (running.value) stop()
  else start()
}

onUnmounted(stop)
</script>

<template>
  <div class="play quiet-breath">
    <p class="hint">找个舒服的姿势坐下。不用追求完美，只要让自己慢下来。</p>

    <div class="stage panel" :class="[phase, { running }]">
      <div class="stage-grid" aria-hidden="true" />
      <div class="stage-corner stage-corner-tl" aria-hidden="true" />
      <div class="stage-corner stage-corner-tr" aria-hidden="true" />
      <div class="stage-corner stage-corner-bl" aria-hidden="true" />
      <div class="stage-corner stage-corner-br" aria-hidden="true" />

      <div class="breath-core" aria-hidden="true">
        <span class="ring ring-3" />
        <span class="ring ring-2" />
        <span class="ring ring-1" />
        <span class="orb" />
      </div>

      <div class="readout">
        <span class="readout-code">{{ phaseCode }}</span>
        <p class="phase-label" :class="`phase-label--${phase}`">
          <span class="label-base">{{ labelBase }}</span>
          <span v-if="showDots" class="label-dots" aria-hidden="true">
            <span
              v-for="n in DOTS"
              :key="n"
              class="label-dot"
              :style="{ animationDelay: `${n * 0.22}s` }"
            >·</span>
          </span>
        </p>
        <p class="phase-tip">吸 4 秒 · 呼 6 秒</p>
      </div>
    </div>

    <button type="button" class="ctrl" @click="toggle">
      {{ running ? '结束' : '开始呼吸' }}
    </button>
  </div>
</template>

<style scoped>
.quiet-breath {
  display: grid;
  gap: 1.1rem;
  max-width: 28rem;
}

.hint {
  margin: 0;
  opacity: 0.72;
  font-size: 0.92rem;
  line-height: 1.65;
}

.stage {
  --breathe-cyan: rgba(94, 228, 255, 0.55);
  --breathe-violet: rgba(168, 120, 255, 0.35);
  --breathe-warm: rgba(255, 196, 140, 0.45);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 18rem;
  padding: 2rem 1.5rem 1.75rem;
  overflow: hidden;
  isolation: isolate;
}

.stage-grid {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba(94, 228, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(94, 228, 255, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 72%);
}

.stage-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgba(94, 228, 255, 0.28);
  border-style: solid;
  transition: border-color 0.6s var(--ease);
}

.stage-corner-tl { top: 0.85rem; left: 0.85rem; border-width: 1px 0 0 1px; }
.stage-corner-tr { top: 0.85rem; right: 0.85rem; border-width: 1px 1px 0 0; }
.stage-corner-bl { bottom: 0.85rem; left: 0.85rem; border-width: 0 0 1px 1px; }
.stage-corner-br { bottom: 0.85rem; right: 0.85rem; border-width: 0 1px 1px 0; }

.breath-core {
  position: relative;
  width: 9rem;
  height: 9rem;
  display: grid;
  place-items: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(94, 228, 255, 0.18);
  transition:
    transform 4s var(--ease),
    opacity 0.8s var(--ease),
    border-color 0.6s var(--ease);
}

.ring-1 {
  width: 5.5rem;
  height: 5.5rem;
  box-shadow: 0 0 24px rgba(94, 228, 255, 0.08);
}

.ring-2 {
  width: 7.25rem;
  height: 7.25rem;
  opacity: 0.55;
}

.ring-3 {
  width: 9rem;
  height: 9rem;
  opacity: 0.3;
}

.orb {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 32%, rgba(220, 245, 255, 0.5), transparent 52%),
    radial-gradient(circle at center, rgba(94, 228, 255, 0.22), rgba(120, 80, 200, 0.08) 68%, transparent 100%);
  border: 1px solid rgba(94, 228, 255, 0.42);
  box-shadow:
    0 0 32px rgba(94, 228, 255, 0.18),
    inset 0 0 20px rgba(168, 120, 255, 0.08);
  transition:
    transform 4s var(--ease),
    opacity 0.8s var(--ease),
    box-shadow 0.8s var(--ease);
}

.stage.inhale .orb {
  transform: scale(1.28);
  opacity: 1;
  box-shadow:
    0 0 48px rgba(94, 228, 255, 0.28),
    inset 0 0 28px rgba(168, 120, 255, 0.12);
}

.stage.inhale .ring-1 { transform: scale(1.18); border-color: var(--breathe-cyan); }
.stage.inhale .ring-2 { transform: scale(1.12); opacity: 0.7; }
.stage.inhale .ring-3 { transform: scale(1.06); opacity: 0.45; }

.stage.exhale .orb {
  transform: scale(0.72);
  opacity: 0.55;
  box-shadow:
    0 0 20px rgba(168, 120, 255, 0.12),
    inset 0 0 16px rgba(94, 228, 255, 0.06);
  transition-duration: 6s;
}

.stage.exhale .ring-1 {
  transform: scale(0.88);
  opacity: 0.45;
  border-color: rgba(168, 120, 255, 0.35);
  transition-duration: 6s;
}

.stage.exhale .ring-2 {
  transform: scale(0.92);
  opacity: 0.3;
  transition-duration: 6s;
}

.stage.exhale .ring-3 {
  transform: scale(0.96);
  opacity: 0.18;
  transition-duration: 6s;
}

.stage.idle .orb {
  transform: scale(1);
  opacity: 0.82;
}

.stage.running .stage-corner {
  border-color: rgba(94, 228, 255, 0.5);
}

.stage.inhale .stage-corner {
  border-color: rgba(94, 228, 255, 0.62);
}

.stage.exhale .stage-corner {
  border-color: rgba(168, 120, 255, 0.45);
}

.readout {
  position: relative;
  z-index: 1;
  margin-top: 1.5rem;
  text-align: center;
}

.readout-code {
  display: inline-block;
  margin-bottom: 0.55rem;
  padding: 0.2rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: rgba(94, 228, 255, 0.85);
  border: 1px solid rgba(94, 228, 255, 0.22);
  border-radius: 2px;
  background: rgba(10, 14, 18, 0.45);
}

.stage.inhale .readout-code {
  animation: code-pulse-in 1.6s ease-in-out infinite;
}

.stage.exhale .readout-code {
  color: rgba(200, 168, 255, 0.9);
  border-color: rgba(168, 120, 255, 0.28);
  animation: code-pulse-out 2.4s ease-in-out infinite;
}

.phase-label {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.label-base {
  display: inline-block;
}

.label-dots {
  display: inline-flex;
  align-items: flex-end;
  margin-left: 0.05em;
  gap: 0.08em;
}

.label-dot {
  display: inline-block;
  line-height: 1;
  opacity: 0.35;
  transform: translateY(0);
}

.phase-label--idle .label-base {
  animation: idle-breathe 3.2s ease-in-out infinite;
}

.phase-label--inhale .label-base {
  animation: text-rise 1.6s ease-in-out infinite;
}

.phase-label--inhale .label-dot {
  animation: dot-wave-in 1.35s ease-in-out infinite;
}

.phase-label--exhale .label-base {
  animation: text-fall 2.4s ease-in-out infinite;
}

.phase-label--exhale .label-dot {
  animation: dot-wave-out 2.1s ease-in-out infinite;
}

.phase-tip {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  opacity: 0.48;
}

.ctrl {
  min-height: var(--touch);
  padding: 0.65rem 1.2rem;
  border: 1px solid rgba(94, 228, 255, 0.35);
  border-radius: var(--radius);
  background: rgba(94, 228, 255, 0.06);
  color: rgba(180, 240, 255, 0.95);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition: background 0.2s var(--ease), border-color 0.2s var(--ease);
}

.ctrl:hover {
  background: rgba(94, 228, 255, 0.12);
  border-color: rgba(94, 228, 255, 0.55);
}

@keyframes idle-breathe {
  0%, 100% { opacity: 0.72; }
  50% { opacity: 1; }
}

@keyframes text-rise {
  0%, 100% { opacity: 0.88; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-1px); }
}

@keyframes text-fall {
  0%, 100% { opacity: 0.78; transform: translateY(0); }
  50% { opacity: 0.95; transform: translateY(1px); }
}

@keyframes dot-wave-in {
  0%, 100% {
    opacity: 0.2;
    transform: translateY(0) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px) scale(1.1);
    text-shadow: 0 0 10px rgba(94, 228, 255, 0.55);
  }
}

@keyframes dot-wave-out {
  0%, 100% {
    opacity: 0.18;
    transform: translateY(-2px) scale(0.88);
  }
  50% {
    opacity: 0.85;
    transform: translateY(2px) scale(1);
    text-shadow: 0 0 8px rgba(168, 120, 255, 0.45);
  }
}

@keyframes code-pulse-in {
  0%, 100% {
    box-shadow: 0 0 0 rgba(94, 228, 255, 0);
  }
  50% {
    box-shadow: 0 0 14px rgba(94, 228, 255, 0.22);
  }
}

@keyframes code-pulse-out {
  0%, 100% {
    box-shadow: 0 0 0 rgba(168, 120, 255, 0);
  }
  50% {
    box-shadow: 0 0 12px rgba(168, 120, 255, 0.18);
  }
}

@media (prefers-reduced-motion: reduce) {
  .phase-label--idle .label-base,
  .phase-label--inhale .label-base,
  .phase-label--exhale .label-base,
  .phase-label--inhale .label-dot,
  .phase-label--exhale .label-dot,
  .stage.inhale .readout-code,
  .stage.exhale .readout-code {
    animation: none;
  }

  .phase-label--inhale .label-dot,
  .phase-label--exhale .label-dot {
    opacity: 0.75;
  }
}

@media (max-width: 720px) {
  .quiet-breath {
    max-width: none;
  }

  .stage {
    min-height: 16rem;
    padding: 1.5rem 1rem 1.35rem;
  }

  .breath-core {
    width: 7.5rem;
    height: 7.5rem;
  }

  .ring-1 { width: 4.5rem; height: 4.5rem; }
  .ring-2 { width: 6rem; height: 6rem; }
  .ring-3 { width: 7.5rem; height: 7.5rem; }
  .orb { width: 3.75rem; height: 3.75rem; }
}
</style>
