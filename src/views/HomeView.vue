<script setup>
import { RouterLink } from 'vue-router'
import { profile } from '../composables/useData'
import { useDecode } from '../composables/useDecode'

const decoded = useDecode(() => profile.value.callsign)

const gates = [
  { code: '01', label: 'About', to: '/about' },
  { code: '02', label: 'Projects', to: '/projects' },
  { code: '03', label: 'Tools', to: '/tools' },
  { code: '04', label: 'Blog', to: '/blog' },
  { code: '05', label: 'Kids', to: '/kids' },
]
</script>

<template>
  <section class="view-frame home">
    <p class="kicker"><span>{{ profile.station }}</span> Personal site</p>
    <h1 class="callsign">{{ decoded }}</h1>
    <p class="role">{{ profile.role }}</p>
    <p class="tagline">{{ profile.tagline }}</p>

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
  min-height: 100%;
  max-height: 100%;
  overflow: hidden;
  padding-block: 0.4rem;
}

.callsign {
  margin: 0 0 1.1rem;
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 8vw, 6.4rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 0.92;
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

.tagline {
  margin: 0 0 2.2rem;
  max-width: 28ch;
  font-size: clamp(1.05rem, 2vw, 1.28rem);
  font-weight: 300;
  line-height: 1.5;
  color: var(--mist);
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
  .callsign {
    font-size: clamp(2.2rem, 12vw, 3.2rem);
  }

  .tagline {
    margin-bottom: 1.5rem;
  }
}
</style>
