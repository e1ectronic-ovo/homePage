<script setup>
import { RouterLink } from 'vue-router'
import { profile } from '../composables/useData'
import { useDecode } from '../composables/useDecode'

const decoded = useDecode(() => profile.value.callsign)

const gates = [
  { code: '01', label: 'About', to: '/about' },
  { code: '02', label: 'Blog', to: '/blog' },
  { code: '03', label: 'Kids', to: '/kids' },
]
</script>

<template>
  <section class="view-frame home">
    <p class="kicker"><span>{{ profile.station }}</span> Personal site</p>
    <div class="callsign-wrap">
      <span class="callsign-ghost" aria-hidden="true">{{ profile.callsign }}</span>
      <h1 class="callsign">{{ decoded }}</h1>
    </div>
    <p class="role">{{ profile.role }}</p>
    <p class="tagline-wrap">
      <span class="tagline">{{ profile.tagline }}</span>
    </p>

    <nav class="gates" aria-label="站点入口">
      <RouterLink v-for="item in gates" :key="item.to" :to="item.to" class="gate">
        <span>{{ item.code }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="links">
      <a v-for="l in profile.links" :key="l.href" :href="l.href" target="_blank" rel="noreferrer" class="ext">
        {{ l.label }} ↗
      </a>
      <a v-if="profile.email" :href="`mailto:${profile.email}`" class="ext">Email ↗</a>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  padding-block: 0.4rem;
}

@media (min-width: 721px) {
  .home {
    min-height: 100%;
  }
}

.callsign-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin: 0 0 1.1rem;
  overflow: hidden;
  vertical-align: top;
}

.callsign,
.callsign-ghost {
  margin: 0;
  font-family: var(--font-home-display);
  font-size: clamp(2.6rem, 8vw, 6.4rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 0.92;
  white-space: nowrap;
}

.callsign-ghost {
  display: block;
  visibility: hidden;
  user-select: none;
  pointer-events: none;
}

.callsign {
  position: absolute;
  inset: 0 auto auto 0;
  color: var(--mist);
}

.role {
  margin: 0 0 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ice);
}

.tagline-wrap {
  width: 100%;
  max-width: 100%;
  margin: 0 0 2.2rem;
}

.tagline {
  display: block;
  font-size: clamp(1.05rem, 2vw, 1.28rem);
  font-weight: 300;
  line-height: 1.5;
  color: var(--mist);
  white-space: nowrap;
}

.gates {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 1.6rem;
  margin-bottom: 1.6rem;
}

.gate {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mist);
  opacity: 0.72;
  padding: 0.25rem 0;
  border-bottom: 1px solid transparent;
  transition: opacity 0.3s var(--ease), border-color 0.3s var(--ease);
}

.gate span {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  color: var(--warm);
}

.gate:hover {
  opacity: 1;
  border-bottom-color: var(--ice);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.ext {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ice-bright);
  border-bottom: 1px solid transparent;
  padding-bottom: 0.15rem;
  transition: border-color 0.25s var(--ease);
}

.ext:hover {
  border-bottom-color: var(--ice);
}

@media (max-width: 720px) {
  .home {
    justify-content: flex-start;
    min-height: auto;
    overflow: visible;
    padding-block: clamp(1rem, 4vh, 2rem) 1.5rem;
  }

  .callsign,
  .callsign-ghost {
    font-size: clamp(1.05rem, calc((100vw - 4rem) / 8.5), 2.15rem);
    letter-spacing: -0.02em;
  }

  .tagline-wrap {
    margin-bottom: 1.5rem;
  }

  .tagline {
    font-size: clamp(0.66rem, calc((100vw - 4rem) / 22), 0.88rem);
  }

  .gates {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    margin-bottom: 1.25rem;
  }

  .gate {
    min-height: var(--touch);
    padding: 0.45rem 0;
    font-size: 1rem;
    opacity: 0.85;
  }

  .ext {
    min-height: var(--touch);
    display: inline-flex;
    align-items: center;
  }
}
</style>
