<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const clock = ref('--:--:--')
let timer = 0

function formatUtc(date) {
  return date.toISOString().slice(11, 19)
}

onMounted(() => {
  clock.value = formatUtc(new Date())
  timer = window.setInterval(() => {
    clock.value = formatUtc(new Date())
  }, 1000)
})

onUnmounted(() => {
  window.clearInterval(timer)
})

const path = computed(() => route.path)
const channel = computed(() => route.meta.label || 'HOME')
</script>

<template>
  <footer class="status">
    <span class="cell">
      <em>UTC</em>
      {{ clock }}
    </span>
    <span class="cell hide-sm">
      <em>PATH</em>
      {{ path }}
    </span>
    <span class="cell">
      <em>CH</em>
      {{ channel }}
    </span>
    <span class="cell live">
      <i class="dot" aria-hidden="true" />
      LINK NOMINAL
    </span>
  </footer>
</template>

<style scoped>
.status {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0 0.15rem;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--warm);
}

.cell {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
}

.cell em {
  font-style: normal;
  color: var(--ice);
}

.live {
  color: var(--mist);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ice);
  opacity: 0.85;
  animation: pulse 2.8s var(--ease) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 720px) {
  .hide-sm {
    display: none;
  }

  .status {
    letter-spacing: 0.08em;
  }
}
</style>
