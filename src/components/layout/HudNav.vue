<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { profile } from '../../composables/useData'

const route = useRoute()
const listRef = ref(null)
const indicator = ref({ x: 0, w: 0, ready: false })

const items = [
  { to: '/', label: 'Home', match: 'exact' },
  { to: '/about', label: 'About', match: 'exact' },
  { to: '/blog', label: 'Blog', match: 'prefix' },
  { to: '/kids', label: 'Kids', match: 'prefix' },
]

function isActive(item) {
  if (item.match === 'prefix') return route.path.startsWith(item.to)
  return route.path === item.to
}

function updateIndicator() {
  const list = listRef.value
  if (!list) return
  const active = list.querySelector('.is-active')
  if (!active) {
    indicator.value.ready = false
    return
  }
  const listBox = list.getBoundingClientRect()
  const box = active.getBoundingClientRect()
  indicator.value = {
    x: box.left - listBox.left,
    w: box.width,
    ready: true,
  }
}

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    updateIndicator()
  },
)

onMounted(() => {
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIndicator)
})

const station = computed(() => profile.value.station)
</script>

<template>
  <header class="hud">
    <RouterLink class="brand" to="/" aria-label="返回首页">
      <span class="brand-mark" aria-hidden="true" />
      <span class="brand-text">
        <span class="brand-code">{{ station }}</span>
        <span class="brand-name">{{ profile.callsign }}</span>
      </span>
    </RouterLink>

    <nav class="nav" aria-label="主导航">
      <ul ref="listRef" class="nav-list">
        <li v-for="item in items" :key="item.to">
          <RouterLink
            :to="item.to"
            class="nav-link"
            :class="{ 'is-active': isActive(item) }"
          >
            {{ item.label }}
          </RouterLink>
        </li>
        <span
          class="nav-indicator"
          :class="{ 'is-ready': indicator.ready }"
          :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.w}px` }"
          aria-hidden="true"
        />
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.hud {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.85rem 0 0.95rem;
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.brand-mark {
  width: 11px;
  height: 11px;
  border: 1px solid var(--ice);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}

.brand-code {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: var(--ice);
}

.brand-name {
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.nav-list {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.15rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-link {
  display: block;
  padding: 0.4rem 0.7rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--mist);
  opacity: 0.55;
  transition: opacity 0.25s var(--ease);
}

.nav-link:hover,
.nav-link.is-active {
  opacity: 1;
}

.nav-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  background: var(--ice);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.35s var(--ease), width 0.35s var(--ease), opacity 0.25s var(--ease);
}

.nav-indicator.is-ready {
  opacity: 1;
}

@media (max-width: 720px) {
  .hud {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    padding-top: 0.2rem;
  }

  .brand-name {
    font-size: 0.82rem;
    letter-spacing: 0.12em;
  }

  .nav-list {
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    margin: 0 -0.25rem;
    padding: 0 0.25rem 2px;
  }

  .nav-list::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    padding: 0.55rem 0.7rem;
    min-height: var(--touch);
    display: flex;
    align-items: center;
    scroll-snap-align: start;
    letter-spacing: 0.12em;
  }
}
</style>
