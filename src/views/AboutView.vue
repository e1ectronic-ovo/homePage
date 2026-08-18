<script setup>
import { profile } from '../composables/useData'
</script>

<template>
  <section class="view-frame about">
    <div class="lead-col">
      <p class="kicker"><span>01</span> About</p>
      <h1>{{ profile.about.lead }}</h1>
    </div>

    <div class="copy-col">
      <p v-for="(paragraph, i) in profile.about.body" :key="i">{{ paragraph }}</p>

      <ul class="focus">
        <li v-for="item in profile.about.focus" :key="item.code" class="panel">
          <span>{{ item.code }}</span>
          <strong>{{ item.label }}</strong>
          <em>{{ item.note }}</em>
        </li>
      </ul>

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
  max-width: 20ch;
}
.copy-col p {
  margin: 0 0 1.1rem;
  max-width: 58ch;
  font-size: 1.02rem;
  line-height: 1.8;
  color: rgba(200, 214, 220, 0.86);
}
.focus {
  list-style: none;
  margin: 2.2rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}
.focus li {
  display: grid;
  grid-template-columns: 4.2rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 1rem;
  padding: 1rem 1.1rem;
}
.focus span {
  grid-row: 1 / 3;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--ice);
  padding-top: 0.25rem;
}
.focus strong {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.focus em {
  font-style: normal;
  font-size: 0.9rem;
  opacity: 0.75;
  line-height: 1.6;
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
</style>
