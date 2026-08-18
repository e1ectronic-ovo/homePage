<script setup>
import { profile } from '../composables/useData'
</script>

<template>
  <section class="view-frame about">
    <div class="lead-col">
      <p class="kicker"><span>01</span> About</p>
      <h1>
        <span class="lead-line">{{ profile.about.lead[0] }}</span>
        <span class="lead-line">{{ profile.about.lead[1] }}</span>
      </h1>
    </div>

    <div class="copy-col">
      <p v-for="(paragraph, i) in profile.about.body" :key="i">{{ paragraph }}</p>

      <div class="links">
        <a
          v-for="link in profile.links"
          :key="link.href"
          class="ext"
          :href="link.href"
          target="_blank"
          rel="noreferrer"
        >
          {{ link.label }}
          <span aria-hidden="true">↗</span>
        </a>
        <a v-if="profile.email" :href="`mailto:${profile.email}`" class="ext">
          Email
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: clamp(2rem, 6vw, 5rem);
  align-items: start;
}
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.6vw, 2.7rem);
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1.2;
}
.lead-line {
  display: block;
}
.copy-col p {
  margin: 0 0 1.1rem;
  max-width: 58ch;
  font-size: 1.02rem;
  line-height: 1.8;
  color: rgba(200, 214, 220, 0.86);
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1.8rem;
}
.ext {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
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
@media (max-width: 860px) {
  .about {
    grid-template-columns: 1fr;
  }
  h1 {
    max-width: 24ch;
  }
}

@media (max-width: 720px) {
  h1 {
    font-size: clamp(1.55rem, 6.5vw, 2.2rem);
  }

  .copy-col p {
    font-size: 0.98rem;
    line-height: 1.75;
  }

  .ext {
    min-height: var(--touch);
    align-items: center;
  }
}
</style>
