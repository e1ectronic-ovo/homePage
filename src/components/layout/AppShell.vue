<script setup>
import { useRoute } from 'vue-router'
import HudNav from './HudNav.vue'
import Starfield from './Starfield.vue'
import StatusBar from './StatusBar.vue'

const route = useRoute()
</script>

<template>
  <div class="shell" :class="{ 'is-home': route.path === '/' }">
    <Starfield />
    <div class="grid" aria-hidden="true" />
    <div class="vignette" aria-hidden="true" />

    <div class="window">
      <a class="skip" href="#main">Skip to content</a>
      <span class="tick tick-tl" aria-hidden="true" />
      <span class="tick tick-tr" aria-hidden="true" />
      <span class="tick tick-bl" aria-hidden="true" />
      <span class="tick tick-br" aria-hidden="true" />

      <HudNav />

      <main id="main" class="viewport" tabindex="-1">
        <RouterView v-slot="{ Component }">
          <Transition name="view" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>

      <StatusBar />
    </div>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  min-height: 100dvh;
  overflow-x: clip;
  background: #07090d;
}

.shell.is-home {
  height: 100dvh;
  overflow: hidden;
}

.grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.45;
  background-image:
    linear-gradient(rgba(200, 214, 220, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 214, 220, 0.035) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 78%);
}

.is-home .grid {
  display: none;
}

.vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 38%, rgba(6, 8, 10, 0.42) 100%);
}

.window {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  height: 100%;
  padding: var(--frame) clamp(1rem, 4vw, 2.75rem);
}

.is-home .window {
  height: 100dvh;
}

.skip {
  position: absolute;
  left: 1rem;
  top: 0.6rem;
  z-index: 5;
  transform: translateY(-160%);
  padding: 0.35rem 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--void);
  background: var(--ice-bright);
}

.skip:focus {
  transform: none;
}

.tick {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
  border-color: var(--ice);
  border-style: solid;
  opacity: 0.55;
}

.tick-tl {
  top: 10px;
  left: 10px;
  border-width: 1px 0 0 1px;
}

.tick-tr {
  top: 10px;
  right: 10px;
  border-width: 1px 1px 0 0;
}

.tick-bl {
  bottom: 10px;
  left: 10px;
  border-width: 0 0 1px 1px;
}

.tick-br {
  bottom: 10px;
  right: 10px;
  border-width: 0 1px 1px 0;
}

.viewport {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.is-home .viewport {
  overflow: hidden;
}

.viewport :deep(.view-frame) {
  flex: 1;
  width: min(1180px, 100%);
}

.viewport:focus {
  outline: none;
}

.view-enter-active,
.view-leave-active {
  transition: opacity 0.42s var(--ease), transform 0.42s var(--ease);
}

.view-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.view-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
